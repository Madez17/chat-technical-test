const formatMessage = (username, text) => {
   const time = new Date();
   const hours = time.getHours()%12 || 12;
   const minutes = time.getMinutes() <= 9 ? `0${time.getMinutes()}` : time.getMinutes(); 
   const amOrPm = time.getHours() >= 12 ? 'pm' : 'am';
   return {
      username,
      text,
      time: `${hours}:${minutes} ${amOrPm} <i class="fas fa-check check"></i>`
   }
}

module.exports = formatMessage;