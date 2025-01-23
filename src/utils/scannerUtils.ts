import Quagga from 'quagga';

export const initializeScanner = (onDetected: (result: string) => void) => {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: "#interactive",
      constraints: {
        facingMode: "environment"
      },
    },
    decoder: {
      readers: [
        "ean_reader",
        "ean_8_reader",
        "code_128_reader"
      ]
    }
  }, (err) => {
    if (err) {
      console.error("Quagga initialization failed:", err);
      return;
    }
    console.log("Quagga initialization succeeded");
    Quagga.start();
  });

  Quagga.onDetected((result) => {
    if (result.codeResult.code) {
      onDetected(result.codeResult.code);
    }
  });
};

export const cleanupScanner = () => {
  Quagga.stop();
};