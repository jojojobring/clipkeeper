export async function getSharePointAccessToken(clientId: string, clientSecret: string, tenantId: string): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const scope = 'https://graph.microsoft.com/.default';
  
  const tokenBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope
  });

  console.log('Requesting access token from:', tokenUrl);

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token response error:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: errorText
    });
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  console.log('Successfully obtained access token');
  
  return tokenData.access_token;
}