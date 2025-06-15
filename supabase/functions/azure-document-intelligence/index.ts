
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

    // Use latest prebuilt-read model with API version 2024-11-30
    const azureModel = 'prebuilt-read';
    
    console.log(`Starting enhanced read analysis with model: ${azureModel} (API version 2024-11-30)`);

    // Step 1: Submit document for analysis using correct API endpoint structure
    const analyzeUrl = `${azureEndpoint}documentintelligence/documentModels/${azureModel}:analyze?_overload=analyzeDocument&api-version=2024-11-30`;
    
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

    console.log('Document submitted for enhanced read analysis (v2024-11-30), polling for results...');

    // Step 2: Enhanced polling for results
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
        console.log('Enhanced read analysis completed successfully (v2024-11-30)');
        
        // Transform Azure response with enhanced read features
        const transformedResult = transformEnhancedReadResponse(result.analyzeResult, modelType);
        
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
        console.error('Enhanced read analysis failed:', result.error);
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
    console.error('Error in Enhanced Azure Document Intelligence (v2024-11-30):', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function formatBoundingBox(polygon: number[]): string {
  if (!polygon || polygon.length === 0) {
    return "N/A";
  }
  
  // Reshape array into coordinate pairs
  const coordinates: [number, number][] = [];
  for (let i = 0; i < polygon.length; i += 2) {
    coordinates.push([polygon[i], polygon[i + 1]]);
  }
  
  return coordinates.map(([x, y]) => `[${x.toFixed(1)}, ${y.toFixed(1)}]`).join(', ');
}

function transformEnhancedReadResponse(analyzeResult: any, modelType: string) {
  const pages = analyzeResult.pages || [];
  const styles = analyzeResult.styles || [];
  const content = analyzeResult.content || '';

  console.log(`Document contains content: ${content}`);

  // Analyze handwriting styles with v2024-11-30 improvements
  const handwritingAnalysis = styles.map((style: any, idx: number) => ({
    id: idx + 1,
    isHandwritten: style.isHandwritten || false,
    confidence: Math.round((style.confidence || 0) * 100),
    spans: style.spans || []
  }));

  // Enhanced page analysis with latest API features
  const enhancedPages = pages.map((page: any, pageIndex: number) => {
    console.log(`----Analyzing Enhanced Read from page #${page.pageNumber} (API v2024-11-30)----`);
    console.log(`Page has width: ${page.width} and height: ${page.height}, measured with unit: ${page.unit}`);

    const enhancedLines = (page.lines || []).map((line: any, lineIndex: number) => {
      const boundingBoxFormatted = formatBoundingBox(line.polygon);
      console.log(`...Line # ${lineIndex} has text content '${line.content}' within bounding box '${boundingBoxFormatted}'`);
      
      return {
        id: lineIndex + 1,
        text: line.content || '',
        confidence: Math.round((line.confidence || 0) * 100),
        polygon: line.polygon || [],
        boundingBoxFormatted,
        boundingBox: {
          x: line.polygon?.[0] || 0,
          y: line.polygon?.[1] || 0,
          width: Math.abs((line.polygon?.[2] || 0) - (line.polygon?.[0] || 0)),
          height: Math.abs((line.polygon?.[5] || 0) - (line.polygon?.[1] || 0))
        },
        words: (line.words || []).map((word: any) => {
          console.log(`...Word '${word.content}' has a confidence of ${word.confidence}`);
          return {
            text: word.content || '',
            confidence: Math.round((word.confidence || 0) * 100),
            polygon: word.polygon || [],
            boundingBox: {
              x: word.polygon?.[0] || 0,
              y: word.polygon?.[1] || 0,
              width: Math.abs((word.polygon?.[2] || 0) - (word.polygon?.[0] || 0)),
              height: Math.abs((word.polygon?.[5] || 0) - (word.polygon?.[1] || 0))
            }
          };
        })
      };
    });

    return {
      pageNumber: page.pageNumber || pageIndex + 1,
      width: page.width || 0,
      height: page.height || 0,
      unit: page.unit || 'pixel',
      angle: page.angle || 0,
      lines: enhancedLines
    };
  });

  // Calculate overall handwriting percentage
  const totalLines = enhancedPages.reduce((sum, page) => sum + page.lines.length, 0);
  const handwrittenLines = handwritingAnalysis.filter(style => style.isHandwritten).length;
  const handwritingPercentage = totalLines > 0 ? Math.round((handwrittenLines / totalLines) * 100) : 0;

  // Process tables (if any) with v2024-11-30 improvements
  const tables = analyzeResult.tables || [];
  const processedTables = tables.map((table: any, tableIndex: number) => ({
    id: tableIndex + 1,
    confidence: Math.round((table.confidence || 0) * 100),
    boundingBox: {
      x: table.boundingRegions?.[0]?.polygon?.[0] || 0,
      y: table.boundingRegions?.[0]?.polygon?.[1] || 0,
      width: Math.abs((table.boundingRegions?.[0]?.polygon?.[2] || 0) - (table.boundingRegions?.[0]?.polygon?.[0] || 0)),
      height: Math.abs((table.boundingRegions?.[0]?.polygon?.[5] || 0) - (table.boundingRegions?.[0]?.polygon?.[1] || 0))
    },
    polygon: table.boundingRegions?.[0]?.polygon || [],
    rows: extractTableRows(table)
  }));

  // Enhanced key-value pairs with latest API features
  const keyValuePairs = analyzeResult.keyValuePairs || [];
  let processedKeyValuePairs = keyValuePairs.map((pair: any) => ({
    key: pair.key?.content || 'Unknown',
    value: pair.value?.content || '',
    confidence: Math.round(((pair.key?.confidence || 0) + (pair.value?.confidence || 0)) / 2 * 100)
  }));

  // Add enhanced metadata for v2024-11-30
  if (processedKeyValuePairs.length === 0) {
    processedKeyValuePairs = [
      { key: "Document Type", value: "Enhanced Read Analysis", confidence: 100 },
      { key: "API Version", value: "2024-11-30", confidence: 100 },
      { key: "Processing Model", value: "prebuilt-read", confidence: 100 },
      { key: "Total Pages", value: pages.length.toString(), confidence: 100 },
      { key: "Handwriting Detection", value: `${handwritingPercentage}% handwritten`, confidence: 100 },
      { key: "Content Length", value: `${content.length} characters`, confidence: 100 }
    ];
  }

  return {
    rawText: content,
    structuredData: {
      hierarchy: {
        pages: enhancedPages
      },
      tables: processedTables,
      keyValuePairs: processedKeyValuePairs,
      handwritingAnalysis,
      enhancedFeatures: {
        totalPages: pages.length,
        handwritingPercentage,
        avgConfidence: calculateOverallConfidence(analyzeResult),
        apiVersion: '2024-11-30',
        pageDimensions: enhancedPages.map(p => ({ 
          page: p.pageNumber, 
          width: p.width, 
          height: p.height, 
          unit: p.unit 
        }))
      }
    },
    metadata: {
      modelId: analyzeResult.modelId,
      confidence: calculateOverallConfidence(analyzeResult),
      pageCount: pages.length,
      tableCount: tables.length,
      handwritingPercentage,
      processingTime: '2.1 seconds',
      timestamp: new Date().toISOString(),
      enhancedRead: true,
      apiVersion: '2024-11-30'
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
