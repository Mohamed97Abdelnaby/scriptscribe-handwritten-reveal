
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName, selectedModel } = await req.json();
    
    const azureKey = Deno.env.get('AZURE_DOCUMENT_INTELLIGENCE_KEY');
    const azureEndpoint = "https://rayaocr.cognitiveservices.azure.com/";
    
    if (!azureKey) {
      throw new Error('Azure Document Intelligence API key not configured');
    }

    console.log(`Processing document: ${fileName} with model: ${selectedModel}`);

    // Convert base64 to binary data
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Map our model names to Azure prebuilt models
    const modelMapping: Record<string, string> = {
      'invoice': 'prebuilt-invoice',
      'receipt': 'prebuilt-receipt',
      'form': 'prebuilt-document',
      'id': 'prebuilt-idDocument',
      'business-card': 'prebuilt-businessCard',
      'mixed': 'prebuilt-read',
      'print': 'prebuilt-read',
      'handwriting': 'prebuilt-read',
      'financial': 'prebuilt-document'
    };

    const azureModel = modelMapping[selectedModel] || 'prebuilt-read';
    
    // Start the analysis operation
    const analyzeUrl = `${azureEndpoint}formrecognizer/documentModels/${azureModel}:analyze?api-version=2023-07-31`;
    
    console.log(`Calling Azure API: ${analyzeUrl}`);
    
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
      console.error('Azure API error:', errorText);
      throw new Error(`Azure API error: ${analyzeResponse.status} - ${errorText}`);
    }

    // Get the operation location for polling
    const operationLocation = analyzeResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('No operation location returned from Azure');
    }

    console.log(`Operation started, polling: ${operationLocation}`);

    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait time
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
        },
      });

      if (!resultResponse.ok) {
        throw new Error(`Failed to get results: ${resultResponse.status}`);
      }

      const resultData = await resultResponse.json();
      
      if (resultData.status === 'succeeded') {
        result = resultData.analyzeResult;
        break;
      } else if (resultData.status === 'failed') {
        throw new Error(`Analysis failed: ${resultData.error?.message || 'Unknown error'}`);
      }
      
      attempts++;
      console.log(`Polling attempt ${attempts}, status: ${resultData.status}`);
    }

    if (!result) {
      throw new Error('Analysis timed out');
    }

    console.log('Analysis completed successfully');

    // Process and structure the results
    const structuredResult = {
      content: result.content || '',
      pages: result.pages || [],
      tables: result.tables || [],
      keyValuePairs: result.keyValuePairs || [],
      documents: result.documents || [],
      confidence: result.pages?.[0]?.lines?.reduce((acc: number, line: any) => acc + (line.confidence || 0), 0) / (result.pages?.[0]?.lines?.length || 1) || 0,
      modelUsed: azureModel,
      processingTime: Date.now(),
    };

    return new Response(JSON.stringify(structuredResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in azure-document-intelligence function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
