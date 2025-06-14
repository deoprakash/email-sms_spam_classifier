document.getElementById('checkBtn').addEventListener('click', async () =>{
    const message = document.getElementById('inputText').value;
    const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    });

    const result = await response.json();
    document.getElementById('result').innerText = 
    result.prediction ===1? 'This is Spam' : 'This is Not Spam';
});