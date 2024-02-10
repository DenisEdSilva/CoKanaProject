import React, { useEffect, useState } from "react";
import { Button, Text, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { NewProduct } from "../../../components/AdminComponents/NewProduct";
import { NewCategory } from "../../../components/AdminComponents/NewCategory";
import firestore from '@react-native-firebase/firestore';
import { EditProduct } from "../../../components/AdminComponents/EditProduct";
import Feather from "react-native-vector-icons/Feather";

interface ProductList {
    id: string;
    category: string;
    name: string;
    quantity: string;
    price: string;
    storeId: string;
}

export default function AdminProducts() {
    const [isLoading, setIsLoading] = useState(false);
    const [currentProductId, setCurrentProductId] = useState("");
    const [currentProductCategory, setCurrentProductCategory] = useState("");
    const [currentProductLocalization, setCurrentProductLocalization] = useState("");
    const [currentProductName, setCurrentProductName] = useState("");
    const [currentProductQuantity, setCurrentProductQuantity] = useState("");
    const [currentProductPrice, setCurrentProductPrice] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [typeModal, setTypeModal] = useState("");
    const [productsList, setProductsList] = useState<ProductList[]>([]);


    useEffect(() => {
        setIsLoading(true);
        const listProducts = firestore().collection('products')
        .onSnapshot((snapshot) => {
            const newProducts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ProductList[];
            setProductsList(newProducts);
            setIsLoading(false);

        }, (error) => {
            console.error(error);
            setIsLoading(false);
        })
        return () => listProducts();
    }, []);

    function openModalNewProduct() {
        setTypeModal("NewProduct");
        setModalVisible(true);
    }

    function openModalNewCategory() {
        setTypeModal("NewCategory");
        setModalVisible(true);
    }

    function handleEditProduct({ id }: { id: string }, { category }: { category: string }, { name }: { name: string }, { quantity }: { quantity: string }, { price }: { price: string }, { storeId }: { storeId: string }) {
        setCurrentProductId(id);
        setCurrentProductCategory(category);
        setCurrentProductLocalization(storeId);
        setCurrentProductName(name);
        setCurrentProductQuantity(quantity);
        setCurrentProductPrice(price);
        setTypeModal("EditProduct");
        setModalVisible(true);
    }
    
    return (
        <View 
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 35,
                backgroundColor: "#ffffff",
            }}
        >
            <TouchableOpacity
                style={{
                    width: "95%",
                    padding: 10, 
                    marginTop: 10,
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
                onPress={openModalNewCategory}
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={openModalNewCategory} >Registrar nova categoria</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{
                    width: "95%",
                    marginTop: 10,
                    padding: 10, 
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
                onPress={openModalNewProduct}
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={openModalNewProduct} >Registrar novo produto</Text>
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
                    { typeModal === "NewProduct" && <NewProduct />}
                    { typeModal === "NewCategory" && <NewCategory />}
                    { typeModal === "EditProduct" && <EditProduct productId={currentProductId} category={currentProductCategory} name={currentProductName} quantity={currentProductQuantity} price={currentProductPrice} storeId={currentProductLocalization} />}
                    <Button title="Fechar" onPress={() => {
                        setModalVisible(!modalVisible);
                        setTypeModal("")
                    }} />
                </View>
            </Modal>
                
            <Text style={{fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#2f5d50"}}>Produtos</Text>
            <ScrollView 
                style={{
                    width: '100%',
                    height: '100%',
                    marginTop: 20,
                    borderTopWidth: 3,
                    borderColor: '#2f5d50',
                    borderBottomWidth: 3,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    backgroundColor: '#ffffff',
                }}
                contentContainerStyle={ isLoading ? 
                    {
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    } : {
                        flex: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}
            >
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#00dd00" />

                        ) : (
                            productsList.map((product) => (
                                <View
                                    style={{
                                        width: "100%",
                                        marginTop: 10,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        backgroundColor: '#ffffff', 
                                        shadowColor: "#000",
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                    }}
                                    key={product.id}
                                >
                                    <View style={{ flex: 1, marginLeft: "2.5%", paddingTop: 10, paddingBottom: 10 }}>
                                        <Text style={{fontSize: 16, fontWeight: "bold"}}>Nome: {product.name}</Text>
                                        <Text style={{fontSize: 16}}>Preço: R$ {product.price}</Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                <TouchableOpacity 
                                    onPress={() => handleEditProduct(
                                        {id: product.id}, 
                                        {category: product.category}, 
                                        {name: product.name}, 
                                        {quantity: product.quantity}, 
                                        {price: product.price}, 
                                        {storeId: product.storeId}
                                    )} 
                                    style={{
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: '#2f5d50', 
                                        borderBottomLeftRadius: 6, 
                                        borderBottomRightRadius: 6, 
                                        borderTopLeftRadius: 6, 
                                        borderTopRightRadius: 6,
                                        backgroundColor: '#3c7a5e',
                                        alignItems: "center",
                                        marginRight: 20
                                    }} 
                                >
                                    <Text 
                                        style={{
                                            fontSize: 16, 
                                            fontWeight: "bold", 
                                            color: "#ffffff",
                                        }}>
                                            Editar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={{
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: '#511c1c',
                                        borderBottomLeftRadius: 6, 
                                        borderBottomRightRadius: 6, 
                                        borderTopLeftRadius: 6, 
                                        borderTopRightRadius: 6,
                                        backgroundColor: '#a92323',
                                        alignItems: "center",
                                        marginRight: "2.5%"
                                    }} 
                                >
                                    <Feather name="trash" size={22} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    )
}