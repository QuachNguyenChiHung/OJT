import axios from 'axios'
import { useEffect, useState } from "react"
import ProductTable from "../Components/ProductTable"


export const MainPage = () => {
    const [bestSellers, setBestSellers] = useState([])
    const [newestItems, setNewestItems] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const bestRes = await axios.get(import.meta.env.VITE_API_URL + '/products/best-selling')
                // Add onSale: true to all best-selling products
                const bestSellersWithSale = bestRes.data.map(product => ({
                    ...product,
                    onSale: true
                }))
                setBestSellers(bestSellersWithSale)

                const newRes = await axios.get(import.meta.env.VITE_API_URL + '/products/newest')
                setNewestItems(newRes.data)
                console.log('Fetched main page data:', {
                    bestSellers: bestSellersWithSale,
                    newestItems: newRes.data
                });
            } catch (error) {
            }
        }
        fetchData();
    }, []);
    return (
        <>
            <ProductTable title="Các Sản Phẩm Bán Chạy" data={bestSellers} pagination={false} />
            <ProductTable title="Các Sản Phẩm Mới Nhất" data={newestItems} pagination={false} />
        </>
    )
}