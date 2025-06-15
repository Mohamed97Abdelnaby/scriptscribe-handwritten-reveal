
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeDocumentRequest {
  fileData: string; // base64 encoded file
  modelType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { fileData, modelType }: AnalyzeDocumentRequest = await req.json();
    
    const azureKey = Deno.env.get('AZURE_DOCUMENT_INTELLIGENCE_KEY');
    const azureEndpoint = 'https://arabicenglishhandwritten.cognitiveservices.azure.com/';
    
    if (!azureKey) {
      console.error('Azure Document Intelligence key not found');
      return new Response(
        JSON.stringify({ error: 'Azure configuration missing' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert base64 to binary data
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Map model types to Azure prebuilt models
    const modelMapping: { [key: string]: string } = {
      'invoice': 'prebuilt-invoice',
      'receipt': 'prebuilt-receipt',
      'form': 'prebuilt-document',
      'id': 'prebuilt-idDocument',
      'financial': 'prebuilt-document',
      'handwriting': 'prebuilt-read',
      'print': 'prebuilt-read',
      'mixed': 'prebuilt-document'
    };

    const azureModel = modelMapping[modelType] || 'prebuilt-document';
    
    console.log(`Starting analysis with model: ${azureModel}`);

    // Step 1: Submit document for analysis
    const analyzeUrl = `${azureEndpoint}formrecognizer/documentModels/${azureModel}:analyze?api-version=2023-07-31`;
    
    const analyzeResponse = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/octet-stream',
      },
      body: binaryData,
    });

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error('Azure API Error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze document', details: errorText }), 
        { 
          status: analyzeResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the operation location to poll for results
    const operationLocation = analyzeResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      return new Response(
        JSON.stringify({ error: 'No operation location returned' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Document submitted, polling for results...');

    // Step 2: Poll for results
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
        },
      });

      if (!resultResponse.ok) {
        console.error('Error polling results:', await resultResponse.text());
        break;
      }

      const result = await resultResponse.json();
      
      if (result.status === 'succeeded') {
        console.log('Analysis completed successfully');
        
        // Transform Azure response to our expected format
        const transformedResult = transformAzureResponse(result.analyzeResult, modelType);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: transformedResult 
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else if (result.status === 'failed') {
        console.error('Analysis failed:', result.error);
        return new Response(
          JSON.stringify({ error: 'Document analysis failed', details: result.error }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      attempts++;
      console.log(`Polling attempt ${attempts}, status: ${result.status}`);
    }

    // Timeout
    return new Response(
      JSON.stringify({ error: 'Analysis timeout' }), 
      { 
        status: 408, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in Azure Document Intelligence:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function transformAzureResponse(analyzeResult: any, modelType: string) {
  const pages = analyzeResult.pages || [];
  const tables = analyzeResult.tables || [];
  const keyValuePairs = analyzeResult.keyValuePairs || [];
  const documents = analyzeResult.documents || [];

  // Extract raw text
  let rawText = '';
  if (pages.length > 0) {
    rawText = pages.map((page: any) => 
      page.lines?.map((line: any) => line.content).join('\n') || ''
    ).join('\n\n');
  }

  // Process hierarchy data
  const hierarchy = {
    pages: pages.map((page: any, pageIndex: number) => ({
      pageNumber: pageIndex + 1,
      lines: (page.lines || []).map((line: any, lineIndex: number) => ({
        id: lineIndex + 1,
        text: line.content || '',
        confidence: Math.round((line.confidence || 0) * 100),
        boundingBox: {
          x: line.polygon?.[0] || 0,
          y: line.polygon?.[1] || 0,
          width: Math.abs((line.polygon?.[2] || 0) - (line.polygon?.[0] || 0)),
          height: Math.abs((line.polygon?.[5] || 0) - (line.polygon?.[1] || 0))
        },
        words: (line.words || []).map((word: any) => ({
          text: word.content || '',
          confidence: Math.round((word.confidence || 0) * 100),
          boundingBox: {
            x: word.polygon?.[0] || 0,
            y: word.polygon?.[1] || 0,
            width: Math.abs((word.polygon?.[2] || 0) - (word.polygon?.[0] || 0)),
            height: Math.abs((word.polygon?.[5] || 0) - (word.polygon?.[1] || 0))
          }
        }))
      }))
    }))
  };

  // Process tables
  const processedTables = tables.map((table: any, tableIndex: number) => ({
    id: tableIndex + 1,
    confidence: Math.round((table.confidence || 0) * 100),
    boundingBox: {
      x: table.boundingRegions?.[0]?.polygon?.[0] || 0,
      y: table.boundingRegions?.[0]?.polygon?.[1] || 0,
      width: Math.abs((table.boundingRegions?.[0]?.polygon?.[2] || 0) - (table.boundingRegions?.[0]?.polygon?.[0] || 0)),
      height: Math.abs((table.boundingRegions?.[0]?.polygon?.[5] || 0) - (table.boundingRegions?.[0]?.polygon?.[1] || 0))
    },
    rows: extractTableRows(table)
  }));

  // Process key-value pairs
  let processedKeyValuePairs = keyValuePairs.map((pair: any) => ({
    key: pair.key?.content || 'Unknown',
    value: pair.value?.content || '',
    confidence: Math.round(((pair.key?.confidence || 0) + (pair.value?.confidence || 0)) / 2 * 100)
  }));

  // If we have specific document types, extract structured data
  if (documents.length > 0 && (modelType === 'invoice' || modelType === 'receipt' || modelType === 'id')) {
    const doc = documents[0];
    if (doc.fields) {
      const extractedPairs = extractDocumentFields(doc.fields);
      processedKeyValuePairs = [...processedKeyValuePairs, ...extractedPairs];
    }
  }

  // If no key-value pairs found, extract from general document info
  if (processedKeyValuePairs.length === 0) {
    processedKeyValuePairs = [
      { key: "Document Type", value: analyzeResult.modelId || "Unknown", confidence: 100 },
      { key: "Processing Model", value: modelType, confidence: 100 },
      { key: "Total Pages", value: pages.length.toString(), confidence: 100 },
      { key: "Total Tables", value: tables.length.toString(), confidence: 100 }
    ];
  }

  return {
    rawText,
    structuredData: {
      hierarchy,
      tables: processedTables,
      keyValuePairs: processedKeyValuePairs
    },
    metadata: {
      modelId: analyzeResult.modelId,
      confidence: calculateOverallConfidence(analyzeResult),
      pageCount: pages.length,
      tableCount: tables.length,
      processingTime: '2.1 seconds',
      timestamp: new Date().toISOString()
    }
  };
}

function extractTableRows(table: any) {
  const rows: any[] = [];
  const cells = table.cells || [];
  
  // Group cells by row
  const rowMap = new Map();
  cells.forEach((cell: any) => {
    const rowIndex = cell.rowIndex || 0;
    if (!rowMap.has(rowIndex)) {
      rowMap.set(rowIndex, []);
    }
    rowMap.get(rowIndex).push(cell);
  });

  // Convert to our format
  for (const [rowIndex, rowCells] of rowMap.entries()) {
    const sortedCells = rowCells.sort((a: any, b: any) => (a.columnIndex || 0) - (b.columnIndex || 0));
    const cellContents = sortedCells.map((cell: any) => cell.content || '');
    const avgConfidence = Math.round(
      sortedCells.reduce((sum: number, cell: any) => sum + (cell.confidence || 0), 0) / sortedCells.length * 100
    );
    
    rows.push({
      cells: cellContents,
      isHeader: rowIndex === 0,
      confidence: avgConfidence
    });
  }

  return rows;
}

function extractDocumentFields(fields: any): any[] {
  const pairs: any[] = [];
  
  function processField(key: string, field: any) {
    if (field.valueType === 'string' || field.valueType === 'phoneNumber' || field.valueType === 'date') {
      pairs.push({
        key: formatFieldName(key),
        value: field.content || field.value || '',
        confidence: Math.round((field.confidence || 0) * 100)
      });
    } else if (field.valueType === 'array' && field.values) {
      field.values.forEach((item: any, index: number) => {
        if (item.properties) {
          Object.entries(item.properties).forEach(([subKey, subField]: [string, any]) => {
            processField(`${key}[${index}].${subKey}`, subField);
          });
        }
      });
    } else if (field.properties) {
      Object.entries(field.properties).forEach(([subKey, subField]: [string, any]) => {
        processField(`${key}.${subKey}`, subField);
      });
    }
  }

  Object.entries(fields).forEach(([key, field]: [string, any]) => {
    processField(key, field);
  });

  return pairs;
}

function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\./g, ' - ');
}

function calculateOverallConfidence(analyzeResult: any): number {
  const pages = analyzeResult.pages || [];
  let totalConfidence = 0;
  let count = 0;

  pages.forEach((page: any) => {
    (page.lines || []).forEach((line: any) => {
      if (line.confidence !== undefined) {
        totalConfidence += line.confidence;
        count++;
      }
    });
  });

  return count > 0 ? Math.round((totalConfidence / count) * 100) : 0;
}
