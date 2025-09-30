import Filter from "../Components/Filter";
import ProductTable from "../Components/ProductTable";

const SearchPage = () => {
    return <>
        <Filter />
        <ProductTable title="Kết Quả Tìm Kiếm" data={[]} pagination={false} />
    </>;
}

export default SearchPage;
