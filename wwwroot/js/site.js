﻿// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let selectedBaudRate = 0;
let selectedDataBits = 0;

// Add an event listener to the dropdown menu
const baudDropdown = document.getElementById("BAUD");
baudDropdown.addEventListener("change", () => {
  selectedBaudRate = parseInt(baudDropdown.value);
});

const dataBitsDropdown = document.getElementById("DataBits");
dataBitsDropdown.addEventListener("change", () => {
  selectedDataBits = parseInt(dataBitsDropdown.value);
});

async function receiveData() {
  for (let i = 0; i < 1; i++) {
    // Request permission to access the serial port
    const port = await navigator.serial.requestPort();

    // Open the serial port with a baud rate of 1200
    await port.open({ baudRate: selectedBaudRate, dataBits: selectedDataBits });

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
  for (let i = 0; i < 1; i++) {
    // Request permission to access the serial port
    const port = await navigator.serial.requestPort();

    // Open the serial port with a baud rate of 1200
    await port.open({ baudRate: selectedBaudRate });

    // Create a writer object for sending data
    const writer = port.writable.getWriter();

    // Send the data
    await writer.write(new TextEncoder().encode("Hello, world!"));

    // Close the writer and serial port
    writer.close();
    port.close();
  }
}
