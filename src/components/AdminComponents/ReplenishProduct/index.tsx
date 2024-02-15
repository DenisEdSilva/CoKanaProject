import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native';
import { firebase } from '@react-native-firebase/firestore'
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../../contexts/auth';

interface Stock {
    id: string
    storeId: string
    productId: string
    quantity: number
}

interface Category {
    id: string
    name: string
}

interface Product {
    id: string
    name: string
    category: string
}

interface Store {
    id: string
    name: string
}

interface StockProps {
    quantity: number,
    productId: string
}


export function ReplenishProduct() {
    const [step, setStep] = useState<number>(1)
    const [stockList, setStockList] = useState<Stock[]>([])
    const [storesList, setStoresList] = useState<Store[]>([])
    const [categoriesList, setCategoriesList] = useState<Category[]>([])
    const [productsList, setProductsList] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState('')
    const [selectedProductId, setSelectedProductId] = useState('')
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [isButtonDisable, setIsButtonDisable] = useState(true)
    const [quantity, setQuantity] = useState<number>()
    const { updateStockQuantity } = useAuth()

    useEffect(() => {
        setLoading(true)
        const unloadStock = firebase.firestore().collection('stock')
            .onSnapshot(querySnapshot => {
                const stock: Stock[] = []
                querySnapshot.forEach(doc => {
                    stock.push({
                        id: doc.id,
                        storeId: doc.data().storeId,
                        productId: doc.data().productId,
                        quantity: doc.data().quantity
                    })
                })
                setStockList(stock)
                setLoading(false)
            })
        
        const unloadStores = firebase.firestore().collection('stores')
            .onSnapshot(querySnapshot => {
                const stores: Store[] = []
                querySnapshot.forEach(doc => {
                    stores.push({
                        id: doc.id,
                        name: doc.data().name
                    })
                })
                setStoresList(stores)
                setLoading(false)
            })

        const unloadCategories = firebase.firestore().collection('categories')
            .onSnapshot(querySnapshot => {
                const categories: Category[] = []
                querySnapshot.forEach(doc => {
                    categories.push({
                        id: doc.id,
                        name: doc.data().name
                    })
                })
                setCategoriesList(categories)
                setLoading(false)
            })

        const unloadProducts = firebase.firestore().collection('products')
            .onSnapshot(querySnapshot => {
                const products: Product[] = []
                querySnapshot.forEach(doc => {
                    products.push({
                        id: doc.id,
                        name: doc.data().name,
                        category: doc.data().category
                    })
                })
                setProductsList(products)
                setLoading(false)
            })
            
        return () => {
            unloadStock()
            unloadStores()
            unloadCategories()
            unloadProducts()
        }
    }, [])

    const handleCategoryChange = (itemValue: string) => {
        setSelectedCategoryId(itemValue);
        const filtered = productsList.filter(produto => produto.category === itemValue);
        setFilteredProducts(filtered);

    };

    const resetToDefault = () => {
        const defaultCategory = categoriesList.length > 0 ? categoriesList[0].id : '';
        const defaultProducts = productsList.filter(product => product.category === defaultCategory);
        const defaultProductId = defaultProducts.length > 0 ? defaultProducts[0].id : '';
        setStep(1);
        setSelectedCategoryId("default");
        setFilteredProducts(defaultProducts);
        setSelectedProductId("default");
    };
    
    

    const handleAddProduct = async ({ quantity, productId }: StockProps ) => {
        try {
            const stockCollectionRef = firebase.firestore().collection('stock');

            const stockQuerySnapshot = await stockCollectionRef.get();

            stockQuerySnapshot.forEach(async stockDoc => {
                const stockData = stockDoc.data();

                if (stockData.productId === productId) {
                    const stockId = stockDoc.id;
                    await updateStockQuantity({
                        quantity,
                        stockId,
                        productId

                    });
                    setQuantity(0);

                }
            });

        } catch (error) {
            console.log("Erro ao adicionar produto:", error);

        }
    }

    const handleStep = () => {
        if (step === 1 && selectedCategoryId === "default") {
            console.log("Selecione uma categoria");
        } else if (step === 2 && selectedProductId === "default") {
            console.log("Selecione um produto");
        } else {
            setStep(step + 1);
            setIsButtonDisable(true);
        }
    }
    


    return (
        <View>
            {loading ? (
                <View>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                (step === 1 && (
                    <View>
                        <Text>
                            Escolha uma categoria
                        </Text>
                        <Picker 
                            selectedValue={selectedCategoryId}
                            onValueChange={(itemValue, itemIndex) => {
                                setSelectedCategoryId(itemValue)
                                handleCategoryChange(itemValue)
                                setIsButtonDisable(false)
                            }}
                        >
                            <Picker.Item label="Selecione uma categoria" value="default"/>
                            {categoriesList.filter(category => category.name).map(category => (
                                <Picker.Item
                                    key={category.id}
                                    label={category.name}
                                    value={category.id}
                                />
                            ))}
                        </Picker>
                        <Button title="Avançar" onPress={handleStep} disabled={isButtonDisable} />
                        <Button title="Reiniciar" onPress={() => {resetToDefault() }} /> 
                    </View>
                )) || (step === 2 && filteredProducts.length > 0 && (
                    <View>
                        <Text>
                            Escolha um produto
                        </Text>
                        <Picker 
                            selectedValue={selectedProductId}
                            onValueChange={(itemValue, itemIndex) => {
                                setSelectedProductId(itemValue)                                
                                setIsButtonDisable(false)
                            }}
                        >
                            <Picker.Item label="Selecione um produto" value="default"/> 
                            {filteredProducts.map(product => (
                                <Picker.Item
                                    key={product.id}
                                    label={product.name}
                                    value={product.id}
                                />
                            ))}
                        </Picker>
                        <Button title="Avançar" onPress={handleStep} disabled={isButtonDisable} />
                        <Button title="Reiniciar" onPress={() => {resetToDefault() }} /> 
                    </View>
                )) || ( step === 3 && (
                    <View>
                        <Text>Loja: { 
                            storesList.filter(store => store.id === stockList[0].storeId)[0].name
                        }</Text>
                        <Text>Produto: { 
                            productsList.find(product => product.id === selectedProductId)?.name
                        }</Text>
                        <TextInput placeholder="Quantidade" keyboardType="numeric" onChangeText={text => setQuantity(Number(text))} />
                        
                        <Button title="Adicionar" onPress={() => {handleAddProduct({ quantity: Number(quantity) || 0, productId: selectedProductId})}} />
                        <Button title="Reiniciar" onPress={() => {resetToDefault() }} /> 
                    </View>
                ))
            )}
        </View>
    )
}