package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/smtp"
    "time"
    "crypto/tls"
    "net"
    "github.com/segmentio/kafka-go"
)

// ✅ Structs with correct JSON tags
type Product struct {
    Name        string  `json:"name"`
    Price       float64 `json:"price"`
    Description string  `json:"description"`
}

type OrderEvent struct {
    OrderId  string    `json:"orderId"`
    Email    string    `json:"email"`
    Products []Product `json:"products"`
}

func sendEmail(to, subject, body string) error {
    from := "abc@gmail.com" // Use a valid email address
    password := "password" // Use a valid app password
    smtpHost := "smtp.gmail.com"
    smtpPort := "587"

    msg := "To: " + to + "\r\n" +
        "Subject: " + subject + "\r\n" +
        "\r\n" +
        body + "\r\n"

    auth := smtp.PlainAuth("", from, password, smtpHost)

    // Connect to the SMTP server
    conn, err := net.Dial("tcp", smtpHost+":"+smtpPort)
    if err != nil {
        return err
    }

    c, err := smtp.NewClient(conn, smtpHost)
    if err != nil {
        return err
    }

    // Start TLS with InsecureSkipVerify
    tlsconfig := &tls.Config{
        InsecureSkipVerify: true,
        ServerName: smtpHost,
    }
    if err = c.StartTLS(tlsconfig); err != nil {
        return err
    }

    if err = c.Auth(auth); err != nil {
        return err
    }
    if err = c.Mail(from); err != nil {
        return err
    }
    if err = c.Rcpt(to); err != nil {
        return err
    }
    wc, err := c.Data()
    if err != nil {
        return err
    }
    _, err = wc.Write([]byte(msg))
    if err != nil {
        return err
    }
    err = wc.Close()
    if err != nil {
        return err
    }
    return c.Quit()
}

// ✅ Kafka readiness check
func waitForKafka() {
	fmt.Println("Waiting for Kafka to be ready...")
	maxRetries := 30
	for i := 0; i < maxRetries; i++ {
		conn, err := kafka.Dial("tcp", "kafka:9092")
		if err == nil {
			conn.Close()
			fmt.Println("✅ Connected to Kafka")
			return
		}
		fmt.Printf("⏳ Attempt %d/%d: Kafka not ready, retrying in 2s...\n", i+1, maxRetries)
		time.Sleep(2 * time.Second)
	}
	log.Fatal("❌ Failed to connect to Kafka after retries")
}

// ✅ Main logic
func main() {
	waitForKafka()

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"kafka:9092"},
		Topic:   "order-events",
		GroupID: "notification-group",
		MinBytes: 1,
		MaxBytes: 10e6, // 10MB
	})
	defer reader.Close()

	fmt.Println("📨 Notification service started, waiting for events...")

	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("⚠️ Error reading Kafka message: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		log.Printf("📦 Received message: %s", string(msg.Value))

		var event OrderEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			log.Printf("❌ Error parsing message: %v", err)
			continue
		}

		log.Printf("📝 Parsed event - OrderID: %s, Email: %s, Products: %d",
			event.OrderId, event.Email, len(event.Products))

		// Validate fields
		if event.Email == "" || event.OrderId == "" {
			log.Println("❌ Invalid order event (missing email or orderId)")
			continue
		}

		// Format product list
		productList := ""
		for i, product := range event.Products {
			productList += fmt.Sprintf("%d. %s - $%.2f\n", i+1, product.Name, product.Price)
		}

		// Send email
		subject := "✅ Order Confirmation"
		body := fmt.Sprintf("Your order %s has been received!\n\nProducts:\n%s\n\nThanks for shopping with us!",
			event.OrderId, productList)

		if err := sendEmail(event.Email, subject, body); err != nil {
			log.Printf("❌ Error sending email to %s: %v", event.Email, err)
		} else {
			log.Printf("✅ Email sent to %s for Order %s", event.Email, event.OrderId)
		}
	}
}
