const colors = [/* ... array de cores ... */];
function setBackgroundByDay() {
  const now = new Date();
  const day = now.getDate();
  document.body.style.background = colors[(day-1)%colors.length];
}
setBackgroundByDay();
