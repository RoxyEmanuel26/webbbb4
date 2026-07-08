const text = "è ▒▒ä¾¿å▒¨å ▒ã▒¡64äººç▒®ã▒¿ã▒▒ ç▒£ä¾▒ç´ äººè ▒▒ä¾¿å▒¨ã▒«ã▒▒å ▒ã▒¡C...";

function fix(str) {
  try {
    return decodeURIComponent(escape(str));
  } catch(e) {
    return "Error: " + e.message;
  }
}

console.log("Original: ", text);
console.log("Fixed: ", fix(text));
