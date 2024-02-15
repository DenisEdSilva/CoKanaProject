import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View} from 'react-native';
import { firebase } from '@react-native-firebase/firestore';


interface ProductListProps {
    categoryId: string,
    productId: string,
    opened: boolean
}

interface Stores {
    id: string,
    name: string,
    index: number
}

interface Stock {
    storeId: string,
    productId: string,
    quantity: number
}

export default function StoreList({ categoryId, productId, opened }: ProductListProps) {
    const [stockList, setStockList] = useState<Stock[]>([]);
    const [storesList, setStoresList] = useState<Stores[]>([]);
    const [isLoadingProducts, setIsLoadingStores] = useState(true);
    const [isLoadingStock, setIsLoadingStock] = useState(true);

    useEffect(() => {
        setIsLoadingStock(true);
        const db = firebase.firestore();
        const storesRef = db.collection('stores').orderBy('index', 'asc')
        const stockRef = db.collection('stock');

        const unloadStores = storesRef

            .onSnapshot(querySnapshot => {
                
                const newStores: Stores[] = [];
                querySnapshot.forEach(doc => {
                    newStores.push({
                        id: doc.id,
                        name: doc.data().name,
                        index: doc.data().index
                    });
                });
                setStoresList(newStores);
                setIsLoadingStores(false);
            });
            const unloadStock = stockRef
                .where('productId', '==', productId)
                .onSnapshot(querySnapshot => {
                    const newStock: Stock[] = [];
                    querySnapshot.forEach(doc => {
                        newStock.push({
                            storeId: doc.data().storeId,
                            productId: doc.data().productId,
                            quantity: doc.data().quantity
                        });
                    });
                    setStockList(newStock);
                    setIsLoadingStock(false);
                })
        

        return () => {
            unloadStores();
            unloadStock();
        }
    }, []);

    const getQuantityForProduct = (productId: string, storeId: string) => {
        const stockItem = stockList.find(stock => stock.productId === productId && stock.storeId === storeId);
        return stockItem ? stockItem.quantity : 0;
    };

    const isLoading = isLoadingProducts  ;

    return (
        <View>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <View>
                    {storesList.filter(store => store.name).map((store, index) => (
                        <View 
                            key={store.id}
                            style={{
                                padding: 10,
                                borderBottomWidth: storesList.length - 2 > index ? 1 : 0,
                            }}
                        >
                            <Text style={{
                                fontSize: 16
                            }}>
                                Loja: {store.name}
                            </Text>
                            <Text 
                                style={{
                                    fontSize: 16
                                }}
                            >Quantidade: {getQuantityForProduct(productId, store.id)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}
