import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { categoryService } from "../../api/categoryService";

const DetailsPage = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getById(id);
                setProductData(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <p>Chargement...</p>; // @TODO : Faire un skeleton 
    if (error) return <p>Erreur : {error.message}</p>; // Faire un vra composant erreur 

    return (
        <div>
            /** A afficher : photo, titre, descirption, prix, promo, produits similaires */
            <img src={productData.pictureURL} alt={productData.title} />
            <h1>{productData.title}</h1>
            <p>{productData.description}</p>
            <p>Prix : {productData.price}€</p>
        </div>
    );
}

export default DetailsPage;