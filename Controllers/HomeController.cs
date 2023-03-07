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
        string[] ports = SerialPort.GetPortNames(); // checks for any available serial ports and displays
        if (ports.Length == 0)
        {
            ViewData["Message"] = "No serial ports found.";
        }
        return View(ports);
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
