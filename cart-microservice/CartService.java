// cart/CartService.java
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpServer;

public class CartService {
    public static void main(String[] args) throws IOException {
        // Create an HTTP server instance listening on port 3003
        HttpServer server = HttpServer.create(new InetSocketAddress(3003), 0);
        
        // Define the context path and handler for the cart summary
        server.createContext("/api/v1/cart/summary", (exchange -> {
            String response = "{\"items\": 2, \"total\": 38.00, \"status\": \"active\"}";
            
            // Set required HTTP headers
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            // Set CORS header to allow the frontend to access this service
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); 
            
            // Send the response back to the client
            exchange.sendResponseHeaders(200, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
            System.out.println("Cart summary request received.");
        }));

        server.setExecutor(null); // Use the default executor
        server.start();
        System.out.println("Cart service listening on port 3003");
    }
}