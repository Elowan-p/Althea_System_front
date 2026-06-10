import React, { useEffect, useState } from "react"; // useEffect vient de react
import { useParams } from "react-router-dom";    // useParams vient de react-router-dom
import { categoryService } from "../../../api/categoryService";
import ProductCard from "../../../components/productCard"

function CategoryPage() {
    const { id } = useParams(); // Récupère l'ID depuis l'URL
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // On crée une fonction async à l'intérieur
        const fetchAll = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getByCategory(id);
                // D'après ton JSON précédent, les produits sont dans response.data.products
                setCategoryData(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                setError(error);""
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAll();
    }, [id]); // On relance si l'ID dans l'URL change

    return (
        <>
            {error && <div className="error">Erreur : {error.message}</div>}
            {/* On affiche le titre de la catégorie dynamiquement si on l'a */}
            <h1>Catégorie : {loading ? "..." : categoryData?.title}</h1>

            <div className="product-list">
                {loading ? (
                    // On affiche 3 Skeletons pendant le chargement
                    [1, 2, 3].map(n => <ProductCard key={n} isLoading={true} />)
                ) : (
                    // On affiche les vrais produits
                    categoryData?.products?.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </>
    );
}

export default CategoryPage;