"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [showPopUp, setShowPopUp] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setcPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [buyRequests, setBuyRequests] = useState([]);





  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert("Image too large (max 5MB)");
      return;
    }
    setImageFile(file);
  };

  const handleSellClick = () => {
    if (!loggedInUser) {
      alert("Please sign in before you can sell items.");
      setShowPopUp("si"); // open sign in popup
      return;
    }
    setShowPopUp("sell"); // user is logged in, open sell form
  };

  const isSellFormValid = () => {
    return (
      title.trim() !== "" &&
      description.trim() !== "" &&
      price > 0 &&
      !isNaN(price) && // Add this check
      imageFile !== null
    );
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();

    // Validate user
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.id) {
      alert("Please log in to sell an item.");
      return;
    }

    // Validate form
    if (!isSellFormValid()) {
      alert("Please fill all required fields correctly");
      return;
    }

    try {
      // Upload image to Cloudinary
      const imageData = new FormData();
      imageData.append("file", imageFile);
      imageData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      console.log("Uploading to Cloudinary with:");
      console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
      console.log(
        "Upload Preset:",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/dvh3rszob/image/upload`,
        { method: "POST", body: imageData }
      );

      console.log("Env check:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

      if (!cloudRes.ok) {
        const errorText = await cloudRes.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Image upload failed");

      // Send data to backend
      const backendRes = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          imageUrl: cloudData.secure_url,
          sellerId: user.id,
        }),
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        throw new Error(errorData.error || "Failed to list item");
      }

      // Success handling
      alert("Item listed successfully!");
      setShowPopUp(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);

      // Refresh items list
      const refreshRes = await fetch("/api/items/index");
      const newItems = await refreshRes.json();
      setItems(newItems);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Something went wrong while listing your item");
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  // In your submit handlers:
  const [items, setItems] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setLoggedInUser(userObj);

        // Optional: Re-save ID to sessionStorage for session-level tasks
        if (userObj.id) {
          sessionStorage.setItem("userId", userObj.id);
        }
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);


  useEffect(() => {
    const fetchItems = async () => {
      try {
        // const res = await fetch("api/items");
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`/api/buy-request?sellerId=${loggedInUser.id}`);
        const data = await res.json();
        setBuyRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };

    if (loggedInUser) {
      fetchRequests();
    }
  }, []);


  const isFormValid = () => {
    if (showPopUp === "si") {
      return email.includes("@") && password !== "";
    }

    return (
      name.trim() !== "" &&
      email.includes("@") &&
      password !== "" &&
      cPassword !== "" &&
      passwordMatch
    );
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");
        setLoggedInUser(data.user);

        // 🔥 Save user to localStorage (for persistence)
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        // 🔐 Save user ID to sessionStorage (for session-specific behavior)
        sessionStorage.setItem("userId", data.user.id);

        setShowPopUp(null);
        setEmail("");
        setPassword("");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong", error.message);
    }
  };


  const handleLogout = () => {
    setLoggedInUser(null); // Clear React state
    localStorage.removeItem("currentUser"); // Clear local storage
    sessionStorage.removeItem("userId"); // 🧹 Clear session storage
    alert("Logged out successfully!");
  };


  const handleBuy = async (item) => {
    alert(
      `Your buy request for : ${item.title} for ₹${item.price} has been sent to ${item.seller?.name}`
    );
    const response = await fetch('/api/buy-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        buyerId: loggedInUser.id,
        sellerId: item.sellerId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setButtonDisabled(true); // grey out the Buy button
      alert('Request sent!');
    } else {
      alert(data.error || 'Something went wrong');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Now this will work

    // Use the state values instead of form.elements
    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Confirm password check
    if (password !== cPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setLoggedInUser(data.user);
        setShowPopUp(null);
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setcPassword("");
      } else {
        alert(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div>
      <nav className="topnav">
        <div className="logo-container">
          <Image
            src="/logo.png"
            height={50}
            width={250}
            alt="Logo"
            className="logo"
          />
        </div>

        <div className="nav-links">
          {loggedInUser ? (
            <>
              <Link href="/users/profile">
                <span className="usrname-link">Hi, {loggedInUser.name}</span>
              </Link>
              <a onClick={() => handleLogout()}>Log Out</a>
              <a className="sell" onClick={() => setShowPopUp("sell")}>
                SELL
              </a>
            </>
          ) : (
            <>
              <a onClick={() => setShowPopUp("si")}>Sign In</a>
              <a onClick={() => setShowPopUp("su")}>Sign Up</a>
              <a className="sell" onClick={handleSellClick}>
                SELL
              </a>
            </>
          )}
        </div>
      </nav>

      <hr />

      <div className="midBar">
        <input type="text" placeholder="Search" />
        <div className="dropdown">
          <button className="dropbutton">
            <span>Categories</span>
            <span className="arrow">▼</span>
          </button>
          <div className="dropdownContent">
            <a href="#">Vehicles</a>
            <a href="#">Gadgets</a>
            <a href="#">Appliances</a>
            <a href="#">Services</a>
          </div>
        </div>
      </div>

      {showPopUp && (
        <>
          <div className="overlay" onClick={() => setShowPopUp(null)}></div>
          <div className="modal">
            <h2>{showPopUp === "si" ? "Sign In" : "Sign Up"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (showPopUp === "su") {
                  handleSignup(e);
                } else if (showPopUp === "si") {
                  handleLogin();
                }
              }}
            >
              {showPopUp === "su" && (
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  if (showPopUp === "su") {
                    setPasswordMatch(newPassword === cPassword);
                  }
                }}
              />

              {showPopUp === "su" && (
                <>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={cPassword}
                    onChange={(e) => {
                      setcPassword(e.target.value);
                      setPasswordMatch(password === e.target.value);
                    }}
                    className={!passwordMatch ? "invalid" : ""}
                  />
                  {!passwordMatch && (
                    <p style={{ color: "red", fontSize: "0.9rem" }}>
                      Passwords do not match
                    </p>
                  )}
                </>
              )}

              <button type="submit" disabled={!isFormValid()}>
                {showPopUp === "si" ? "Log In" : "Create Account"}
              </button>
            </form>
            <button className="close-btn" onClick={() => setShowPopUp(null)}>
              ✖
            </button>
          </div>
        </>
      )}
      {showPopUp === "sell" && (
        <>
          <div className="overlay" onClick={() => setShowPopUp(null)}></div>
          <div className="modal">
            <h2>Sell Your Item</h2>
            <form onSubmit={handleSellSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <button type="submit" disabled={!isSellFormValid()}>
                Submit Item
              </button>
            </form>
            <button className="close-btn" onClick={() => setShowPopUp(null)}>
              ✖
            </button>
          </div>
        </>
      )}

      <div className="item-grid">
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-content">
                <div className="item-image">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={200}
                    height={200}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "auto",
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p style={{ whiteSpace: "pre-line" }}>{item.description}</p>
                  <p>Price: ₹{item.price}</p>
                  <small>Seller: {item.seller?.name || "Unknown"}</small>
                  {loggedInUser && loggedInUser.id !== item.sellerId && (
                    <button disabled={disabledButtons[item.id]} onClick={() => handleBuy(item)}>Buy</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
