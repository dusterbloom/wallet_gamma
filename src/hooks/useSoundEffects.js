import useSound from 'use-sound';
import keyPressSfx from '../assets/sounds/key-press.mp3';
import successSfx from '../assets/sounds/success.mp3';
import sendSfx from '../assets/sounds/send.mp3';
import backSfx from '../assets/sounds/back.mp3';

export const useSoundEffects = () => {
  const [playKeyPress] = useSound(keyPressSfx, { volume: 0.25 });
  const [playSuccess] = useSound(successSfx, { volume: 0.5 });
  const [playSend] = useSound(sendSfx, { volume: 0.5 });
  const [playBack] = useSound(backSfx, { volume: 0.25 });

  return {
    playKeyPress,
    playSuccess,
    playSend,
    playBack
  };
};
