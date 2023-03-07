// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

async function receiveData() {
  for (let i = 0; i < 1; i++) {
    // Request permission to access the serial port
    const port = await navigator.serial.requestPort();

    // Open the serial port with a baud rate of 1200
    await port.open({ baudRate: 9600 });

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
    await port.open({ baudRate: 1200 });

    // Create a writer object for sending data
    const writer = port.writable.getWriter();

    // Send the data
    await writer.write(new TextEncoder().encode("Hello, world!"));

    // Close the writer and serial port
    writer.close();
    port.close();
  }
}
