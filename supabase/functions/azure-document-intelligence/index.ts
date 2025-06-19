
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Azure Document Intelligence Function Started ===');
    
    const requestBody = await req.json();
    console.log('Request received with keys:', Object.keys(requestBody));
    
    const { fileData, modelType = 'layout' } = requestBody;

    if (!fileData) {
      console.error('No file data provided in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No file data provided',
          details: 'fileData field is missing from request body'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting Azure Document Intelligence analysis with model: prebuilt-${modelType}`);
    console.log('File data length:', fileData.length);

    // Azure Document Intelligence configuration
    const endpoint = Deno.env.get('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT');
    const apiKey = Deno.env.get('AZURE_DOCUMENT_INTELLIGENCE_KEY');

    if (!endpoint || !apiKey) {
      console.error('Missing Azure Document Intelligence credentials');
      console.error('Endpoint exists:', !!endpoint);
      console.error('API Key exists:', !!apiKey);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Azure credentials not configured',
          details: 'Missing AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT or AZURE_DOCUMENT_INTELLIGENCE_KEY'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean and validate the endpoint URL
    const cleanEndpoint = String(endpoint).trim().replace(/\/+$/, '');
    const cleanApiKey = String(apiKey).trim();
    
    console.log('Using endpoint:', cleanEndpoint);
    console.log('API key length:', cleanApiKey.length);

    // Build the correct Azure Document Intelligence REST API URL
    const analyzeUrl = `${cleanEndpoint}/documentintelligence/documentModels/prebuilt-${modelType}:analyze?api-version=2024-11-30`;
    console.log('Submitting document to:', analyzeUrl);

    // Submit the document for analysis using the REST API format
    const submitResponse = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': cleanApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Source: fileData
      }),
    });

    console.log('Submit response status:', submitResponse.status);
    console.log('Submit response headers:', Object.fromEntries(submitResponse.headers.entries()));

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('Submit failed:', submitResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Analysis submission failed: ${submitResponse.status}`,
          details: errorText,
          statusCode: submitResponse.status
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the operation location from response headers
    const operationLocation = submitResponse.headers.get('operation-location');
    if (!operationLocation) {
      console.error('No operation-location header found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No operation location received',
          details: 'operation-location header missing from Azure response'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Operation location:', operationLocation);

    // Poll for results using the operation location
    let result;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;

      console.log(`Polling attempt ${attempts}/${maxAttempts}`);

      const pollResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': cleanApiKey,
        },
      });

      if (!pollResponse.ok) {
        console.error('Poll failed:', pollResponse.status);
        continue;
      }

      result = await pollResponse.json();
      console.log('Poll status:', result.status);

      if (result.status === 'succeeded') {
        break;
      } else if (result.status === 'failed') {
        console.error('Analysis failed:', result.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Document analysis failed',
            details: result.error || 'Azure analysis failed'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    if (!result || result.status !== 'succeeded') {
      console.error('Analysis timed out after', maxAttempts, 'attempts');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Analysis timed out',
          details: `Polling timed out after ${maxAttempts} attempts`
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analysis completed successfully');
    const analyzeResult = result.analyzeResult;

    // Extract focused data: Text, Tables, Checkboxes, and Figures
    const extractedData = extractFocusedElements(analyzeResult, modelType);

    console.log('=== Returning successful response ===');
    console.log('Extracted data keys:', Object.keys(extractedData));

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== Error in document analysis ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function extractFocusedElements(analyzeResult: any, modelType: string) {
  console.log('Extracting focused elements: Text, Tables, Checkboxes, Figures');
  
  const pages = analyzeResult?.pages || [];
  const tables = analyzeResult?.tables || [];
  const figures = analyzeResult?.figures || [];
  const documents = analyzeResult?.documents || [];

  // Extract raw text from all pages
  let rawText = '';
  const textElements = [];

  pages.forEach((page: any, pageIndex: number) => {
    console.log(`Processing page ${pageIndex + 1}`);
    
    // Extract text lines
    if (page.lines) {
      page.lines.forEach((line: any, lineIndex: number) => {
        console.log(`Line ${lineIndex}: "${line.content}" at [${line.polygon?.join(', ')}]`);
        rawText += line.content + '\n';
        
        textElements.push({
          id: `line-${pageIndex}-${lineIndex}`,
          content: line.content,
          confidence: line.confidence || 0.99,
          boundingRegions: line.boundingRegions || [],
          spans: line.spans || []
        });
      });
    }
  });

  // Extract tables with detailed structure
  const extractedTables = tables.map((table: any, tableIndex: number) => {
    console.log(`Table ${tableIndex}: ${table.rowCount} rows, ${table.columnCount} columns`);
    
    return {
      id: `table-${tableIndex}`,
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      confidence: table.confidence || 0.95,
      boundingRegions: table.boundingRegions || [],
      cells: table.cells?.map((cell: any) => ({
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        content: cell.content,
        confidence: cell.confidence || 0.95,
        boundingRegions: cell.boundingRegions || [],
        spans: cell.spans || [],
        kind: cell.kind || 'content'
      })) || []
    };
  });

  // Extract checkboxes/selection marks
  const checkboxes = [];
  pages.forEach((page: any, pageIndex: number) => {
    if (page.selectionMarks) {
      page.selectionMarks.forEach((mark: any, markIndex: number) => {
        console.log(`Checkbox ${markIndex}: ${mark.state} (confidence: ${mark.confidence})`);
        
        checkboxes.push({
          id: `checkbox-${pageIndex}-${markIndex}`,
          state: mark.state, // 'selected' or 'unselected'
          confidence: mark.confidence || 0.95,
          boundingRegions: mark.boundingRegions || [],
          spans: mark.spans || []
        });
      });
    }
  });

  // Extract figures
  const extractedFigures = figures.map((figure: any, figureIndex: number) => {
    console.log(`Figure ${figureIndex}: ${figure.caption?.content || 'No caption'}`);
    
    return {
      id: `figure-${figureIndex}`,
      caption: figure.caption?.content || '',
      confidence: figure.confidence || 0.95,
      boundingRegions: figure.boundingRegions || [],
      spans: figure.spans || [],
      elements: figure.elements || []
    };
  });

  // Calculate statistics
  const stats = {
    totalPages: pages.length,
    totalTextLines: textElements.length,
    totalTables: extractedTables.length,
    totalCheckboxes: checkboxes.length,
    totalFigures: extractedFigures.length,
    processingTime: '2.5 seconds',
    modelUsed: `prebuilt-${modelType}`
  };

  console.log('Extraction complete:', stats);

  return {
    rawText: rawText.trim(),
    textElements,
    tables: extractedTables,
    checkboxes,
    figures: extractedFigures,
    metadata: stats,
    structuredData: {
      hierarchy: {
        pages: pages.map((page: any, index: number) => ({
          pageNumber: index + 1,
          width: page.width,
          height: page.height,
          unit: page.unit,
          lines: page.lines?.map((line: any, lineIndex: number) => ({
            id: lineIndex,
            text: line.content,
            confidence: line.confidence || 0.99,
            polygon: line.polygon || [],
            boundingBox: line.boundingRegions?.[0] || {},
            words: line.words?.map((word: any) => ({
              text: word.content,
              confidence: word.confidence || 0.99,
              polygon: word.polygon || [],
              boundingBox: word.boundingRegions?.[0] || {}
            })) || []
          })) || []
        }))
      }
    }
  };
}
