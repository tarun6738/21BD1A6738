const express = require('express');
const axios = require('axios');

const app = express();

const PORT = 5000;
const WINDOW_SIZE = 10;
const TIMEOUT = 500; 

const allowedNumberTypes = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand',
};

let numbers = [];

async function fetchNumbers(type) {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, { timeout: TIMEOUT });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} numbers:`, error);
    return [];
  }
}

function calculateAverage(arr) {
  return arr.length === 0 ? 0 : arr.reduce((acc, num) => acc + num, 0) / arr.length;
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberType = req.params.numberid.toLowerCase();

  if (!allowedNumberTypes[numberType]) {
    return res.status(400).json({ message: 'Invalid number type' });
  }
  


  const newNumbers = await fetchNumbers(allowedNumberTypes[numberType]);


  const uniqueNumbers = [...new Set([...numbers, ...newNumbers])];


  if (uniqueNumbers.length > WINDOW_SIZE) {
    numbers = uniqueNumbers.slice(uniqueNumbers.length - WINDOW_SIZE);
  } else {
    numbers = uniqueNumbers;
  }

  const windowPrevState = numbers.slice(0, numbers.length - newNumbers.length);
  const windowCurrState = numbers;

  const average = calculateAverage(windowCurrState);

  res.json({
    numbers,
    windowPrevState,
    windowCurrState,
    avg: average.toFixed(2),
  });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
