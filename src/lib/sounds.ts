export const playSound = (type: 'success' | 'spin' | 'click' | 'reward') => {
  try {
    const audio = new Audio();
    
    switch(type) {
      case 'success':
        // A simple synth sine wave beep for success
        audio.src = "data:audio/wav;base64,UklGRmIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTwAAAAhMUFFTllkcnZ5dXRrZ2RaVE0/OistLC80OEIWJh0nKjI1OEFHTFFXWmJtcXN7gIOHiouPkI+QjYuIh4B7cmlmXVNJPzQvJyMdFRM=";
        break;
      case 'spin':
        // Short tick for spin
        audio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAABNTU1NTU1NTU1NTU1N";
        break;
      case 'reward':
        // A nice chord/chime for reward
        audio.src = "data:audio/wav;base64,UklGRnwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVgAAABfbm1zZ2ZlZGNiYWBfX15dXFtaWVhXWFVWVFNSUVBQT05OTUxLSklISEZFRENCQD89Ozo5Nzc1NDMyMTAvLiwrKikoJyYkIyIhIB8eHRwbGhkYFxYV";
        break;
      case 'click':
        audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        break;
    }
    
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play prevented', e));
  } catch (e) {
    // Ignore audio errors
  }
};
