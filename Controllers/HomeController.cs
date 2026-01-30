using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SCC.Models;
using System.IO.Ports;

namespace SCC.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        try
        {
            string[] ports = SerialPort.GetPortNames(); // checks for any available serial ports and displays
            if (ports.Length == 0)
            {
                ViewData["Message"] = "No serial ports found.";
                _logger.LogInformation("No serial ports detected on the system.");
            }
            else
            {
                _logger.LogInformation("Detected {PortCount} serial port(s): {Ports}", ports.Length, string.Join(", ", ports));
            }
            return View(ports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving serial ports");
            ViewData["Message"] = "Error: Unable to retrieve serial ports. " + ex.Message;
            return View(Array.Empty<string>());
        }
    }

    public IActionResult Updates() {

        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
