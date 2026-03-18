import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pour la redirection
import { userAuthService } from "../../api/userAuth";

function Register() {
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsError(false);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await userAuthService.register(userData);

            if (response.status === 200 || response.status === 201) {
                // Sauvegarde du token
                localStorage.setItem('token', response.data.token);

                const userInfo = await userAuthService.getInfo(response.data.userId);
                localStorage.setItem('userInfo', JSON.stringify(userInfo.data));

                navigate("/");
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit}>
                <h2>Créer un compte</h2>

                <section>
                    <p><strong>Informations personnelles</strong></p>
                    <input type="text" name="name" placeholder="Nom" required />
                    <input type="text" name="surname" placeholder="Prénom" required />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="0612345678"
                        pattern="^0[1-9][0-9]{8}$"
                        title="Le numéro doit comporter 10 chiffres et commencer par 0"
                        required
                    />
                </section>

                <section>
                    <p><strong>Adresse</strong></p>
                    <input type="text" name="country" placeholder="Pays" required />
                    <input type="text" name="city" placeholder="Ville" required />
                    <input type="text" name="street" placeholder="Adresse" required />
                    <input type="text" name="postalCode" placeholder="Code Postal" required />
                </section>

                <section>
                    <p><strong>Votre entreprise</strong></p>
                    <input type="text" name="companyName" placeholder="Nom de l'entreprise" required />
                    <input type="text" name="siret" placeholder="SIRET" required />
                </section>

                <section>
                    <p><strong>Vos identifiants</strong></p>
                    <input type="email" name="email" placeholder="Email" required />
                    <input type="password" name="password" placeholder="Mot de passe" required />
                </section>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Chargement..." : "Créer un compte"}
                </button>

                {isError && (
                    <p style={{ color: 'red' }}>
                        Échec de la création du compte. Veuillez vérifier les informations.
                    </p>
                )}
            </form>
        </div>
    );
}

export default Register;