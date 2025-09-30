
import ProductTable from "../Components/ProductTable"


export const MainPage = () => {

    return (
        <>
            <ProductTable title="Các Sản Phẩm Bán Chạy" data={[]} pagination={true} />
            <ProductTable title="Các Sản Phẩm Mới Nhất" data={[]} pagination={true} />
        </>
    )
}