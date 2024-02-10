import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Modal, Button, TouchableOpacity } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ProductList from '../../../components/AdminComponents/ProductList';
import Feather from 'react-native-vector-icons/Feather';
import { StockTransfer } from '../../../components/AdminComponents/StockTransfer';
import { ReplenishProduct } from '../../../components/AdminComponents/ReplenishProduct';

interface Product {
    id: string;
    category: string;
    storeId: string;
    name: string;
    price: string;
}

interface Category {
    id: string;
    index: number;
    name: string;
}

interface Store {
    id: string;
    name: string;
}

export default function AdminStock() {
    const [storesList, setStoresList] = useState<Store[]>([]);
    const [productsByStore, setProductsByStore] = useState<{ [key: string]: Product[] }>({});
    const [productList, setProductList] = useState<Product[]>([]);
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [openedStoreId, setOpenedStoreId] = useState<string | null>(null);
    const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [typeModal, setTypeModal] = useState("");

    const productsUnsubsRef = useRef<Record<string, () => void>>({});

    const navigation = useNavigation();
    const isFocused = useIsFocused();


    useEffect(() => {
        if (isFocused) {
            const storesUnsub = firebase.firestore().collection('stores')
                .orderBy('index', 'asc')
                .onSnapshot(querySnapshot => {
                    const newStores: Store[] = [];
                    querySnapshot.forEach(doc => {
                        const storeId = doc.id;
                        newStores.push({
                            id: storeId,
                            name: doc.data().name
                        });

                        productsUnsubsRef.current[storeId]?.();

                        productsUnsubsRef.current[storeId] = firebase.firestore().collection('products')
                            .where('storeId', '==', storeId)
                            .onSnapshot(productsSnapshot => {
                                const productsForStore: Product[] = [];
                                productsSnapshot.forEach(productDoc => {
                                    productsForStore.push({
                                        id: productDoc.id,
                                        category: productDoc.data().category,
                                        storeId: productDoc.data().storeId,
                                        name: productDoc.data().name,
                                        price: productDoc.data().price
                                    });
                                });

                                setProductsByStore(prevProducts => ({
                                    ...prevProducts,
                                    [storeId]: productsForStore
                                }));
                            });

                        });
                        
                        setStoresList(newStores);
                        setLoading(false);
                    });

                    const unsubscribe = firebase.firestore().collection('categories')
                        .onSnapshot((snapshot) => {
                            const newCategories = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            index: doc.data().index,
                            name: doc.data().name,
                            }));
                            setCategoryList(newCategories);
                        }, (error) => {
                            console.error(error);
                        });

            return () => {
                storesUnsub();
                unsubscribe();

                Object.values(productsUnsubsRef.current).forEach(unsub => unsub());
            };
        } else {
            deactivateProductsListeners();
        }	
    }, [isFocused]);
      

    const deactivateProductsListeners = () => {
        Object.values(productsUnsubsRef.current).forEach(unsub => unsub());
        productsUnsubsRef.current = {}; 
    };

    const getProductsByStore = async (storeId: string): Promise<Product[]> => {
        let db = firebase.firestore();
        try {
            const querySnapshot = await db.collection('products')
                .where('storeId', '==', storeId)
                .get();
      
            const products: Product[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                category: doc.data().category,
                storeId: doc.data().storeId,
                name: doc.data().name,
                quantity: doc.data().quantity,
                price: doc.data().price
            }));
      
            return products;
        } catch (error) {
            console.error("Erro ao recuperar os produtos", error);
            return [];
        }
    };
      
    const toggleStoreOpen = (storeId: string) => {
        if (openedStoreId !== storeId) {
            setOpenedStoreId(storeId);
            if (!productsByStore[storeId]) {
                getProductsByStore(storeId).then(products => {
                    setProductsByStore(prevProducts => ({
                        ...prevProducts,
                        [storeId]: products
                    }));
                });
            }
        } else {
            setOpenedStoreId(null);
        }
    };

    const toggleCategoryOpen = (categoryId: string) => {
        if (openedCategoryId !== categoryId) {
            setOpenedCategoryId(categoryId);
            if (!productsByStore[categoryId]) {
                getProductsByStore(categoryId).then(products => {
                    setProductsByStore(prevProducts => ({
                        ...prevProducts,
                        [categoryId]: products
                    }));
                });
            }
        } else {
            setOpenedCategoryId(null);
        }
    }

    function openModalreplenishProduct () {
        setTypeModal("ReplenishProduct");
        setModalVisible(true);
    }

    function openModalStockTransfer () {
        setTypeModal("StockTransfer");
        setModalVisible(true);
    }

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
        }}>
            {
                loading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <ActivityIndicator size={80} color="#68e222" />
                    </View>
                ) : (
                    <View style={{ 
                        width: '100%', 
                        height: '100%',
                        backgroundColor: "#ffffff",
                        }}
                    >
                        <TouchableOpacity style={{
                            width: "95%",
                            marginTop: 10,
                            padding: 10, 
                            alignSelf: "center",
                            borderWidth: 1, 
                            borderColor: '#2f5d50',
                            borderBottomLeftRadius: 6, 
                            borderBottomRightRadius: 6, 
                            borderTopLeftRadius: 6, 
                            borderTopRightRadius: 6,
                            backgroundColor: '#3c7a5e', 
                            alignItems: "center",
                            shadowColor: '#2f5d50',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                            elevation: 6,
                            }} 
                            onPress={openModalreplenishProduct}
                        >
                            <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={openModalreplenishProduct} >Reabastecer Produto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                            width: "95%",
                            marginTop: 10,
                            padding: 10, 
                            alignSelf: "center",
                            borderWidth: 1, 
                            borderColor: '#2f5d50',
                            borderBottomLeftRadius: 6, 
                            borderBottomRightRadius: 6, 
                            borderTopLeftRadius: 6, 
                            borderTopRightRadius: 6,
                            backgroundColor: '#3c7a5e', 
                            alignItems: "center",
                            shadowColor: '#2f5d50',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                            elevation: 6,
                            }} 
                            onPress={openModalStockTransfer}
                        >
                            <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={openModalStockTransfer} >Transferir Produtos</Text>
                        </TouchableOpacity>

                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible={modalVisible}
                            onRequestClose={() => {
                                setModalVisible(!modalVisible);
                                setTypeModal("")
                            }}
                        >
                            <View>
                                { typeModal === "StockTransfer" && <StockTransfer />}
                                { typeModal === "ReplenishProduct" && <ReplenishProduct />}
                                <Button title="Fechar" onPress={() => {
                                    setModalVisible(!modalVisible);
                                    setTypeModal("")
                                }} />
                            </View>
                        </Modal>

                        <View 
                            style={{ 
                                alignContent: 'center', 
                                alignItems: 'center', 
                                marginBottom: 35, 
                            }}
                        >
                            <Text style={{fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#2f5d50"}}>Estoque</Text>
                        </View>
                        <View 
                            style={{
                                width: '100%',
                            backgroundColor: '#ffffff',
                            }}
                        >
                            {storesList.filter((store) => store.name).map((store) => (
                                <View key={store.id} style={{
                                    flexDirection: 'column',
                                    alignItems: 'stretch', 
                                    marginBottom: 10,
                                    backgroundColor: '#ffffff', 
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                }}>
                                    <View 
                                        style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        padding: 10,
                                        backgroundColor: '#f8f8f8',
                                        borderTopWidth: 3,
                                        borderColor: '#2f5d50',
                                        }}
                                    >
                                        <Text style={{ 
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            marginLeft: "2.5%", 
                                        }}>{store.name}</Text>
                                        <TouchableOpacity style={{
                                            padding: 8,
                                            borderWidth: 1,
                                            width: "15%",
                                            borderColor: '#2f5d50', 
                                            borderRadius: 6,
                                            backgroundColor: openedStoreId === store.id ? '#4bb30f' : '#3c7a5e',
                                            alignItems: "center",
                                            marginRight: "2.5%"
                                            }}
                                            onPress={() => toggleStoreOpen(store.id)}
                                        >
                                        <Feather name={openedStoreId === store.id ? "chevron-up" : "chevron-down"} size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                    {openedStoreId === store.id && (
                                        <View style={{ backgroundColor: '#f0f0f0' }}>
                                            {categoryList.filter((category) => category.name).map((category) => (   
                                                <React.Fragment key={category.id}>
                                                    <View style={{ 
                                                        flexDirection: 'row', 
                                                        justifyContent: 'space-between', 
                                                        padding: 10,
                                                        borderBottomWidth: 1,
                                                        borderColor: '#c8c8c8',
                                                        alignItems: "center",
                                                    }}>
                                                        <Text style={{ fontSize: 16 }}>{category.name}</Text>
                                                        <TouchableOpacity 
                                                            style={{
                                                                padding: 5,
                                                                borderWidth: 1,
                                                                width: "12%",
                                                                borderColor: '#2f5d50', 
                                                                borderRadius: 6,
                                                                backgroundColor: openedCategoryId === category.id ? '#4bb30f' : '#3c7a5e',
                                                                alignItems: "center",
                                                                marginRight: "3.75%"
                                                            }}
                                                            onPress={() => toggleCategoryOpen(category.id)}
                                                        >
                                                        <Feather name={openedCategoryId === category.id ? "chevron-up" : "chevron-down"} size={24} color="#ffffff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                    {openedCategoryId === category.id && store && store.id && (
                                                        <ProductList categoryId={category.id} storeId={store.id} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                ))
                            }
                        </View>
                    </View>
                )
            }
        </View>
    );
}


