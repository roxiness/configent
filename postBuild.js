const {appendFileSync} = require('fs')
const footer = '\n\n---\n\n<a href="https://www.freepik.com/vectors/vintage">Vintage vector created by macrovector - www.freepik.com</a>'

appendFileSync('./README.md', footer)