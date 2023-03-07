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
  for (let i = 0; i < 3; i++) {
    // Request permission to access the serial port
    const port = await navigator.serial.requestPort();

    // Open the serial port with a baud rate of 1200
    await port.open({
      parity: selectedParity,
      baudRate: selectedBaudRate,
      dataBits: selectedDataBits,
      stopBits: selectedStopBits,
      readTimeout: selectedRT,
      writeTimeout: selectedWT,
      handshake: selectedHandshake
    });

    // Create a reader object for receiving data
    const reader = port.readable.getReader();

    // Read the incoming data
    const { value, done } = await reader.read();

    // Convert the received data to a string
    const receivedData = new TextDecoder().decode(value);

    // Close the reader and serial port
    reader.cancel();
    port.close();

    // Display the received data in the first <p> tag
    const p = document.getElementById("received-data");
    p.textContent = receivedData;
  }
}

async function sendData() {
  for (let i = 0; i < 3; i++) {
    // Request permission to access the serial port
    const port = await navigator.serial.requestPort();

    // Open the serial port with a baud rate of 1200
    await port.open({
      parity: selectedParity,
      baudRate: selectedBaudRate,
      dataBits: selectedDataBits,
      stopBits: selectedStopBits,
      readTimeout: selectedRT,
      writeTimeout: selectedWT,
      handshake: selectedHandshake
    });

    // Create a writer object for sending data
    const writer = port.writable.getWriter();

    // Send the data
    await writer.write(new TextEncoder().encode("Hello, world!"));

    // Close the writer and serial port
    writer.close();
    port.close();

    await new Promise(resolve => setTimeout(resolve, selectedDelay));

  }
}
