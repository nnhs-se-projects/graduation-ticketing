function generateAccessCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let accessCode = '';

for (let i = 0; i < 6; i++)
{
  const randomIndex = Math.floor(Math.random() * characters.length);
  accessCode += characters.charAt(randomIndex);
}

return AccessCode;
}

const generatedCode = generateAccessCode(); 
console.log(generatedCode);