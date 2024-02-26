import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProductList } from '../ProductList';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface CategoryProps {
    id: string;
    name: string;
    index: number;
}

export function CategoryList({ onSelectCategory }: { onSelectCategory: (categoryId: string) => void }) {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigation<any>();


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await firestore()
          .collection('categories')
          .orderBy('index')
          .get();

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          index: doc.data().index
        }));

        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

    function handleSelectCategory(categoryId: string) {
        nav.navigate("ProductList", { categoryId });
    }

  return (
    <View>
      {loading ? (
        <Text>Carregando categorias...</Text>
      ) : (
        <View style={{ flexDirection: 'column' }}>
          {categories.filter(category => category.name).map(category => (
            <View
                key={category.id}
                style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    backgroundColor: '#ffffff', 
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    marginBottom: 15,
                    elevation: 6,
                }}  
            >
                <TouchableOpacity  
                    style={{
                        width: "100%",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingVertical: 15
                    }}     
                    onPress={() => handleSelectCategory(category.id)}        
                >
                    <Text 
                      style={{ 
                          fontSize: 20, 
                          fontWeight: 'bold',
                          color: '#333333'
                      }}
                    >
                        {category.name}
                    </Text>
                <Icon name="arrow-forward" size={20} color="#333333" />
                </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};