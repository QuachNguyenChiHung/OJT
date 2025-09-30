import ProductDetails from "../Components/ProductDetails";
import ProductTable from "../Components/ProductTable";


const ProductDetailsPage = () => {
    return (
        <>
            <ProductDetails />
            <ProductTable title="Các Sản Phẩm Tương Tự" data={[]} pagination={false} />
        </>
    );
};

export default ProductDetailsPage;