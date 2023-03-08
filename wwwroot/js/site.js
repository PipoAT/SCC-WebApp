// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let selectedBaudRate = 0;
let selectedDataBits = 0;
let selectedStopBits = 0;
let selectedRT = 0;
let selectedWT = 0;
let selectedParity = "";
let selectedHandshake = "";
let selectedDelay = 1000;

// Add an event listener to the dropdown menu
const baudDropdown = document.getElementById("BAUD");
baudDropdown.addEventListener("change", () => {
  selectedBaudRate = parseInt(baudDropdown.value);
});

const parityDropdown = document.getElementById("Parity");
parityDropdown.addEventListener("change", () => {
  selectedParity = parityDropdown.value;
});

const dataBitsDropdown = document.getElementById("DataBits");
dataBitsDropdown.addEventListener("change", () => {
  selectedDataBits = parseInt(dataBitsDropdown.value);
});

const stopBitsDropdown = document.getElementById("StopBits");
stopBitsDropdown.addEventListener("change", () => {
  selectedStopBits = parseInt(stopBitsDropdown.value);
});

const RTDropdown = document.getElementById("ReadTimeout");
RTDropdown.addEventListener("change", () => {
  selectedRT = parseInt(RTDropdown.value);
});

const WTDropdown = document.getElementById("WriteTimeout");
WTDropdown.addEventListener("change", () => {
  selectedWT = parseInt(WTDropdown.value);
});

const HandshakeDropdown = document.getElementById("Handshake");
HandshakeDropdown.addEventListener("change", () => {
  selectedHandshake = HandshakeDropdown.value;
});

const DelayDropdown = document.getElementById("Delay");
DelayDropdown.addEventListener("change", () => {
  selectedDelay = parseInt(DelayDropdown.value);
});

async function receiveData() {
  const logTransmission = document.getElementById("log").checked;
  const port = await navigator.serial.requestPort();
  const dirHandle = await window.showDirectoryPicker();

  let repeatTransmission = true;
  do {
    // Request permission to access the serial port

    // Open the serial port with a baud rate of 1200
    await port.open({
      parity: selectedParity,
      baudRate: selectedBaudRate,
      dataBits: selectedDataBits,
      stopBits: selectedStopBits,
      readTimeout: selectedRT,
      writeTimeout: selectedWT,
      handshake: selectedHandshake,
    });

    // Create a reader object for receiving data
    const reader = port.readable.getReader();

    // Read the incoming data
    const { value, done } = await reader.read();

    // Convert the received data to a string
    const receivedData = new TextDecoder().decode(value);

    // Close the reader and serial port
    try {
      await reader.cancel();
    } catch (e) {
      console.error("Failed to close writer: " + e);
    }

    // Display the received data in the first <p> tag
    const p = document.getElementById("received-data");
    p.textContent = receivedData;

    if (logTransmission) {
      // Log the transmission to a file
      const logFileName = "transmission.txt";
      const logData = p.textContent;

      // Get a directory handle for the directory where you want to save the file

      const fileHandle = await dirHandle.getFileHandle(logFileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable({
        keepExistingData: true,
      });
      await writable.seek(writable.length); // move the file pointer to the end of the file
      await writable.write(logData);
      await writable.write("\n");
      await writable.close();
    }

    try {
      await port.close();
    } catch (e) {
      console.error("Failed to close port: " + e);
    }

    // Check if the "Repeat Transmission?" checkbox is checked
    repeatTransmission = document.getElementById("repeat").checked;
  } while (repeatTransmission);
}

async function sendData() {
  const logTransmission = document.getElementById("log").checked;
  const port = await navigator.serial.requestPort();
  const dirHandle = await window.showDirectoryPicker();
  const logFileName = "transmission.txt";
  const fileHandle = await dirHandle.getFileHandle(logFileName, {
    create: true,
  });

  do {
    // Request permission to access the serial port
    

    // Open the serial port with a baud rate of 1200
    await port.open({
      parity: selectedParity,
      baudRate: selectedBaudRate,
      dataBits: selectedDataBits,
      stopBits: selectedStopBits,
      readTimeout: selectedRT,
      writeTimeout: selectedWT,
      handshake: selectedHandshake,
    });

    // Create a writer object for sending data
    const writer = port.writable.getWriter();

    // Send the data
    await writer.write(new TextEncoder().encode("Hello, world!"));

    // Close the writer
    try {
      await writer.close();
    } catch (e) {
      console.error("Failed to close writer: " + e);
    }

    if (logTransmission) {
      // Log the transmission to a file
      const logData = "Transmission: Hello, world!\n";

      // Get a directory handle for the directory where you want to save the file
      const writable = await fileHandle.createWritable();
      await writable.seek(writable.length); // move the file pointer to the end of the file
      await writable.write(logData);
      await writable.close();
    }

    // Close the serial port
    try {
      await port.close();
    } catch (e) {
      console.error("Failed to close port: " + e);
    }
    repeatTransmission = document.getElementById("repeat").checked;
  } while (repeatTransmission);
}
