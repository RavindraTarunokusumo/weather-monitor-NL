export async function GET() {
  return Response.json({
    status: "ok",
    service: "dutch-weather-intelligence",
    version: "0.1.0",
  });
}
