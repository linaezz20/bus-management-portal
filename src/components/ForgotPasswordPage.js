"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiMail, FiArrowLeft } from "react-icons/fi"
import "./ForgotPasswordPage.css"

const API_URL = process.env.REACT_APP_API_URL || "https://nfc-application-latest-4.onrender.com"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="success-message">
          <h2>Email envoyé!</h2>
          <p>Un lien de réinitialisation a été envoyé à votre adresse email.</p>
          <button onClick={() => navigate("/login")} className="back-to-login">
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <button className="back-button" onClick={() => navigate("/login")}>
          <FiArrowLeft /> Retour
        </button>

        <h2>Réinitialisation du mot de passe</h2>
        <p>Entrez votre email pour recevoir un lien de réinitialisation</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Votre adresse email"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
