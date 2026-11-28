import { Text, Modal, View, ScrollView, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { Member, Item } from "../models/model";
import { styles } from "./MemberDetailsStyles";

type Props = {
    visible: boolean;
    member: Member | null;
    items: Item[];
    onClose: () => void;
    computeBalance: (member: Member) => number;
};

export default function MemberDetails ({
    visible,
    member,
    items,
    onClose,
    computeBalance
}: Props) {

    const [membersItem, setMembersItem] = useState<Item | null>(null);

    const balance = member ? computeBalance(member) : 0;

    const memberItems = member 
        ? items.filter((item) => item.paidFor.includes(member.id))
        : [];

    return (
        <Modal
            visible={visible}
            transparent animationType="fade" 
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.popup}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {member?.name}{" "}
                            {balance < 0
                                ? `is owed ${Math.abs(balance).toFixed(0)}`
                                : balance > 0
                                ? `owes ${balance.toFixed(0)}`
                                : "Settled"}
                        </Text>
                    </View>
                    <View style={styles.body}>
                        <Text>Expenses</Text>
                        <View style={styles.bodyTable}>
                            <View style={styles.bodyTableHeader}>
                                <Text style={styles.bodyTableHeaderText}>Item</Text>
                                <Text style={styles.bodyTableHeaderText}>Price</Text>
                            </View>
                            <ScrollView style={styles.bodyTableList}>
                                {memberItems.map((item) => (
                                    <View 
                                        key={item.id}
                                        style={styles.bodyTableListItems}
                                    >
                                        <Text>{item.name}</Text>
                                        <Text>{item.price}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
};
