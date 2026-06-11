import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";    
import { categoryService } from "../../../api/categoryService";
import ProductCard from "../../../components/productCard"

function CategoryPage() {
    const { id } = useParams(); 
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        const fetchAll = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getByCategory(id);
                
                setCategoryData(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                setError(error);""
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAll();
    }, [id]); 

    return (
        <>
            {error && <div className="error">Erreur : {error.message}</div>}
            {}
            <h1>Catégorie : {loading ? "..." : categoryData?.title}</h1>

            <div className="product-list">
                {loading ? (
                    
                    [1, 2, 3].map(n => <ProductCard key={n} isLoading={true} />)
                ) : (
                    
                    categoryData?.products?.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </>
    );
}

export default CategoryPage;