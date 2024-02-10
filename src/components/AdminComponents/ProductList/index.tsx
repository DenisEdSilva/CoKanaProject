import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View} from 'react-native';
import { firebase } from '@react-native-firebase/firestore';


interface ProductListProps {
    categoryId: string,
    storeId: string,
}

interface Products {
    id: string,
    category: string,
    storeId: string,
    name: string,
    price: string
}

interface Stock {
    storeId: string,
    productId: string,
    quantity: number
}

export default function ProductList({ categoryId, storeId }: ProductListProps) {
    const [productList, setProductList] = useState<Products[]>([]);
    const [stockList, setStockList] = useState<Stock[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingStock, setIsLoadingStock] = useState(true);

    useEffect(() => {
        const unsubProducts = firebase.firestore().collection('products')
            .where('storeId', '==', storeId)
            .where('category', '==', categoryId)
            .onSnapshot(querySnapshot => {
                const products: Products[] = [];
                querySnapshot.forEach(doc => {
                    products.push({
                        id: doc.id, 
                        category: doc.data().category,
                        storeId: doc.data().storeId,
                        name: doc.data().name,
                        price: doc.data().price
                    });
                });
                setProductList(products);
                setIsLoadingProducts(false);
            });

        const unsubStock = firebase.firestore().collection('stock')
            .where('storeId', '==', storeId)
            .onSnapshot(querySnapshot => {
                const stock: Stock[] = [];
                querySnapshot.forEach(doc => {
                    stock.push({
                        storeId: doc.data().storeId,
                        productId: doc.data().productId,
                        quantity: doc.data().quantity
                    });
                });
                setStockList(stock);
                setIsLoadingStock(false);
            })

        return () => {
            unsubProducts();
            unsubStock();
        }
    }, [categoryId, storeId ]);

    const getQuantityForProduct = (productId: string) => {
        const stockItem = stockList.find(stock => stock.productId === productId);
        return stockItem ? stockItem.quantity : 0;
    };

    const isLoading = isLoadingProducts  ;

    return (
        <View style={{
            paddingLeft: 10, 
            paddingRight: 10,
            borderBottomWidth: 1,
            borderColor: '#c8c8c8',
            backgroundColor: '#e3e3e3',
            alignItems: "center",
        }}>
            { isLoading ? <ActivityIndicator /> : (
                productList.map((product) => (
                    <View 
                        key={product.id}
                        style={{
                            padding: 14,
                            alignSelf: 'flex-start',
                            width: '100%',
                            borderBottomColor: '#c8c8c8',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}    
                    >
                       <View>
                            <Text style={{ fontSize: 16, alignSelf: 'flex-start' }}>
                                Nome: {product.name}
                            </Text>
                            <Text style={{ fontSize: 16, alignSelf: 'flex-start' }}>
                                Quantidade: {getQuantityForProduct(product.id)}
                            </Text>
                        </View>
                    </View>
                ))  
            )}
        </View>
    );
}
