async function getToken() {
  try {
    const response = await fetch('https://dev-adjhwqm2ghoh48cl.us.auth0.com/oauth/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        "client_id": "vZVMJmCBFwAagThWXSNlB8DmUSuZzsZ8",
        "client_secret": "Zbwr-wej60GweTMNyEp215PoGzxgHM5fW5VqRfkMGDF2mAFpJVQLuJ3me3h0FTcg",
        "audience": "https://api.lynq.video",
        "grant_type": "client_credentials"
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('=== AUTH0 TOKEN ===');
    console.log(data.access_token);
    console.log('=== END TOKEN ===');
    
    return data.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

getToken();