import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { firebase } from "@react-native-firebase/firestore";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CategoryList } from "../../../components/AdminComponents/CategoryList";

function NewItem() {
    const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null);

    const toggleCategoryOpen = (categoryId: string) => {
        if (openedCategoryId !== categoryId) {
            setOpenedCategoryId(categoryId);
        } else {
            setOpenedCategoryId(null);
        }
    }

    return (
        <View>
            <View>
                <CategoryList onSelectCategory={ toggleCategoryOpen }/>
            </View>
        </View>
    )
}

export default NewItem;
