import { useEffect, useState } from "react";
import Image from "next/image";


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyRequests, setBuyRequests] = useState([]);

  const handleAccept = async (requestId, itemId) => {
    await fetch(`/api/buy-request/handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'accept', itemId }),
    });
    // Refresh the list
    setBuyRequests(buyRequests.filter(req => req.id !== requestId));
  };

  const handleReject = async (requestId) => {
    await fetch(`/api/buy-request/handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'reject' }),
    });
    // Refresh the list
    setBuyRequests(buyRequests.filter(req => req.id !== requestId));
  };


  useEffect(() => {
    const fetchUserAndItems = async () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const userObj = JSON.parse(storedUser);
        setUser(userObj);

        // Fetch items for this user using their ID
        const response = await fetch(`/api/items?sellerId=${userObj.id}`);
        const data = await response.json();
        console.log(data)

        if (response.ok) {
          setItems(data);
        } else {
          console.error("Failed to fetch user items:", data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndItems();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading profile...</p>;
  if (!user) return <p style={{ textAlign: "center", marginTop: "2rem" }}>No user found. Please log in.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Welcome, {user.name} 👋</h1>
        <p>Email: {user.email}</p>

        <h2 style={styles.subheader}>Your Listings</h2>
        {items.length > 0 ? (
          <ul style={styles.list}>
            {items.map((item) => (
              <li key={item.id} style={styles.item}>
                <Image //added by me
                  src={item.imageUrl}
                  alt={item.title}
                  width={200}
                  height={200}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "auto",
                  }} />
                <strong>{item.title}</strong> – ₹{item.price}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items listed yet.</p>
        )}
        <h2 style={styles.subheader}>Buy Requests</h2>
        {buyRequests.length === 0 ? (
          <p>No buy requests.</p>
        ) : (
          <ul style={styles.list}>
            {buyRequests.map((req) => (
              <li key={req.id} style={styles.item}>
                <p>
                  <strong>{req.buyer.name}</strong> wants to buy <strong>{req.item.title}</strong> for ₹{req.item.price}
                </p>
                <button onClick={() => handleAccept(req.id, req.item.id)}>Accept</button>
                <button onClick={() => handleReject(req.id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "3rem auto",
    padding: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  subheader: {
    fontSize: "1.25rem",
    marginTop: "2rem",
    borderBottom: "1px solid #ddd",
    paddingBottom: "0.5rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
  },
};
