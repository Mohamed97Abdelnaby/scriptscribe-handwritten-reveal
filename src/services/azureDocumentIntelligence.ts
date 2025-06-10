
export interface AzureCredentials {
  endpoint: string;
  apiKey: string;
}

export interface AzureAnalysisResult {
  status: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  analyzeResult?: {
    pages: Array<{
      pageNumber: number;
      words: Array<{
        content: string;
        confidence: number;
        boundingBox: number[];
      }>;
      lines: Array<{
        content: string;
        confidence: number;
        boundingBox: number[];
      }>;
    }>;
    tables?: Array<{
      rowCount: number;
      columnCount: number;
      cells: Array<{
        content: string;
        rowIndex: number;
        columnIndex: number;
        confidence: number;
      }>;
    }>;
    keyValuePairs?: Array<{
      key: { content: string; confidence: number };
      value: { content: string; confidence: number };
    }>;
    documents?: Array<{
      docType: string;
      confidence: number;
      fields: Record<string, {
        content: string;
        confidence: number;
        valueType: string;
      }>;
    }>;
  };
}

export interface ExtractedData {
  name?: string;
  date?: string;
  amount?: string;
  id?: string;
  confidence: number;
  rawData: AzureAnalysisResult;
}

class AzureDocumentIntelligenceService {
  private credentials: AzureCredentials | null = null;

  setCredentials(credentials: AzureCredentials) {
    this.credentials = credentials;
    // Store in localStorage for session persistence
    localStorage.setItem('azure-credentials', JSON.stringify(credentials));
  }

  getCredentials(): AzureCredentials | null {
    if (this.credentials) return this.credentials;
    
    const stored = localStorage.getItem('azure-credentials');
    if (stored) {
      this.credentials = JSON.parse(stored);
      return this.credentials;
    }
    
    return null;
  }

  clearCredentials() {
    this.credentials = null;
    localStorage.removeItem('azure-credentials');
  }

  validateCredentials(credentials: AzureCredentials): boolean {
    const endpointPattern = /^https:\/\/.*\.cognitiveservices\.azure\.com\/?$/;
    const keyPattern = /^[A-Za-z0-9]{64}$/;
    
    return endpointPattern.test(credentials.endpoint) && keyPattern.test(credentials.apiKey);
  }

  async analyzeDocument(file: File, modelId: string = 'prebuilt-document'): Promise<ExtractedData> {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('Azure credentials not configured');
    }

    try {
      console.log('Starting Azure Document Intelligence analysis:', { fileName: file.name, modelId });

      // Step 1: Submit document for analysis
      const analyzeUrl = `${credentials.endpoint}/formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31`;
      
      const formData = new FormData();
      formData.append('file', file);

      const submitResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': credentials.apiKey,
        },
        body: formData,
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        throw new Error(`Azure API error: ${submitResponse.status} - ${errorText}`);
      }

      // Get the operation location from response headers
      const operationLocation = submitResponse.headers.get('Operation-Location');
      if (!operationLocation) {
        throw new Error('No operation location returned from Azure');
      }

      console.log('Document submitted, polling for results...');

      // Step 2: Poll for completion
      const result = await this.pollForCompletion(operationLocation, credentials.apiKey);

      // Step 3: Extract structured data
      const extractedData = this.extractStructuredData(result);

      console.log('Analysis complete:', extractedData);
      return extractedData;

    } catch (error) {
      console.error('Azure Document Intelligence error:', error);
      throw error;
    }
  }

  private async pollForCompletion(operationLocation: string, apiKey: string): Promise<AzureAnalysisResult> {
    const maxAttempts = 30;
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(operationLocation, {
          method: 'GET',
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Polling error: ${response.status}`);
        }

        const result: AzureAnalysisResult = await response.json();
        
        if (result.status === 'succeeded') {
          return result;
        } else if (result.status === 'failed') {
          throw new Error('Document analysis failed');
        }

        // Still running, wait and try again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Analysis timed out');
  }

  private extractStructuredData(result: AzureAnalysisResult): ExtractedData {
    const extractedData: ExtractedData = {
      confidence: 0,
      rawData: result
    };

    if (!result.analyzeResult) {
      return extractedData;
    }

    // Extract from documents (prebuilt models)
    if (result.analyzeResult.documents && result.analyzeResult.documents.length > 0) {
      const doc = result.analyzeResult.documents[0];
      extractedData.confidence = doc.confidence * 100;

      // Common field mappings
      const fields = doc.fields;
      if (fields) {
        // Name variations
        extractedData.name = fields.CustomerName?.content || 
                           fields.VendorName?.content || 
                           fields.Name?.content ||
                           fields.FullName?.content;

        // Date variations  
        extractedData.date = fields.InvoiceDate?.content ||
                           fields.TransactionDate?.content ||
                           fields.Date?.content ||
                           fields.IssueDate?.content;

        // Amount variations
        extractedData.amount = fields.InvoiceTotal?.content ||
                             fields.TotalAmount?.content ||
                             fields.Amount?.content ||
                             fields.Total?.content;

        // ID variations
        extractedData.id = fields.InvoiceId?.content ||
                         fields.DocumentId?.content ||
                         fields.Id?.content ||
                         fields.Number?.content;
      }
    }

    // Fallback: Extract from key-value pairs
    if (result.analyzeResult.keyValuePairs && (!extractedData.name && !extractedData.date && !extractedData.amount && !extractedData.id)) {
      for (const pair of result.analyzeResult.keyValuePairs) {
        const key = pair.key.content.toLowerCase();
        const value = pair.value.content;

        if (key.includes('name') && !extractedData.name) {
          extractedData.name = value;
        } else if (key.includes('date') && !extractedData.date) {
          extractedData.date = value;
        } else if ((key.includes('amount') || key.includes('total')) && !extractedData.amount) {
          extractedData.amount = value;
        } else if ((key.includes('id') || key.includes('number')) && !extractedData.id) {
          extractedData.id = value;
        }
      }
    }

    return extractedData;
  }

  async sendToLovableAPI(data: ExtractedData, lovableEndpoint?: string): Promise<void> {
    if (!lovableEndpoint) {
      console.log('No Lovable API endpoint provided, skipping data send');
      return;
    }

    try {
      const payload = {
        name: data.name,
        date: data.date,
        amount: data.amount,
        id: data.id,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
        source: 'azure-document-intelligence'
      };

      const response = await fetch(lovableEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Lovable API error: ${response.status}`);
      }

      console.log('Data successfully sent to Lovable API');
    } catch (error) {
      console.error('Failed to send data to Lovable API:', error);
      throw error;
    }
  }
}

export const azureDocumentIntelligence = new AzureDocumentIntelligenceService();
