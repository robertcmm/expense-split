import { Text, View, StyleSheet, TextInput, Button, Modal, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import AddItemModal, { type ItemDraft } from "../components/AddItemModal";
import ExpenseTotals from "../components/ExpenseTotals";

type Item = {
  id: number;
  name: string;
  price: string;
  paidFor: number[];
  paidBy: number | null;
}; 

export default function App() {
  const [items, setItems] = useState<{ id: number; name: string; price: string; paidFor: number[]; paidBy: number | null }[]>([]);
  const [members, setMembers] = useState<{ id: number; name: string; spent: string; paid: string }[]>([]);

  const [popupVisible, setPopupVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberSpent, setNewMemberSpent] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [openItemMenuId, setOpenItemMenuId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const addItem = (draft: ItemDraft, editingItemId: number | null) => {
    if (!draft.name.trim() || !draft.price) return;
    
    const previousItem = 
      editingItemId === null 
        ? undefined
        : items.find((item) => item.id === editingItemId);

    if (editingItemId !== null && !previousItem) return;

    const previousShare = previousItem?.paidFor.length 
      ? Number(previousItem.price) / previousItem.paidFor.length 
      : 0;
    
    const newShare = draft.paidForMemberIds.length 
      ? Number(draft.price) / draft.paidForMemberIds.length 
      : 0;

    setItems((currentItems) => {
      const updatedItem = {
        id:
          editingItemId ??
          currentItems.reduce((maxId, item) => Math.max(maxId, item.id), -1) + 1,
        name: draft.name,
        price: draft.price,
        paidFor: draft.paidForMemberIds,
        paidBy: draft.paidByMemberId,
      };

      return editingItemId === null
        ? [...currentItems, updatedItem]
        : currentItems.map((item) =>
            item.id === editingItemId ? updatedItem : item
          );
    });
    
    setMembers((currentMembers) =>
      currentMembers.map((member) => {
        let spent = Number(member.spent);
        let paid = Number(member.paid);

        if (previousItem?.paidFor.includes(member.id)) spent -= previousShare;
        if (previousItem?.paidBy === member.id) paid -= Number(previousItem.price);
        if (draft.paidForMemberIds.includes(member.id)) spent += newShare;
        if (draft.paidByMemberId === member.id) paid += Number(draft.price);

        return { ...member, spent: spent.toString(), paid: paid.toString() };
      })
    );

    const share = Number(draft.price) / draft.paidForMemberIds.length;

    // setMembers((currentMembers) =>
    //   currentMembers.map((member) =>
    //     draft.paidForMemberIds.includes(member.id)
    //       ? { ...member, spent: (Number(member.spent) + share).toString()}
    //       : member
    //   )
    // )

    setItemName("");
    setPrice("");
    setSelectedMemberId(null);
    setPopupVisible(false);
  };

  const deleteItem = (itemId: number) => {
    const item = items.find((currentItem) => currentItem.id === itemId);
    if (!item) return;

    const share = item.paidFor.length
      ? Number(item.price) / item.paidFor.length
      : 0;
    setItems((currentItems) =>
      currentItems.filter((currentItem) => currentItem.id !== itemId)
    );

    // if (item.paidBy !== null) {
    //   setMembers((currentMembers) =>
    //     currentMembers.map((member) =>
    //       member.id === item.paidBy
    //         ? {
    //             ...member,
    //             spent: (Number(member.spent) - Number(item.price)).toString(),
    //           }
    //         : member
    //     )
    //   );
      
    // }

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        item.paidFor.includes(member.id)
          ? {
              ...member,
              spent: (Number(member.spent) - share).toString(),
            }
          : member
      )
    )

    

    
  };

  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) return;

    setMembers((currentMembers) => [
      ...currentMembers,
      { id: currentMembers.length, name, spent: newMemberSpent || "0", paid: "0" },
    ]);
    setNewMemberName("");
    setNewMemberSpent("");
  };

  const computeItemTotal = () => {
    return items.reduce((total, item) => total + Number(item.price), 0);
  };

  const computeMemberExpenses = (member: { id: number; name: string; spent: string; paid: string }) => {
    return Number(member.spent) - Number(member.paid)
  };

  const computeMemberTotal = ( member: { id: number; name: string; spent: string }) => {
    return (
      member.spent
    )
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.HeaderSection}>
          <Text style={styles.titleHeader}>Expense Splitter</Text>
          <Button title="Members" onPress={() => setMembersModalVisible(true)} />
        </View>
        <Modal
          visible={membersModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMembersModalVisible(false)}
        >
          <View style={styles.backdrop}>
            <View style={[styles.popup, styles.membersPopup]}>
              <Text>Group Members</Text>
              <ScrollView
                style={styles.memberList}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.tableHeader}>
                  <Text>Name</Text>
                  <Text>Spent</Text>
                </View>
                {/* {members.length === 0 ? (
                  <View style={styles.memberRow}>
                    <Text style={styles.placeholderText}>you</Text>
                    <Text style={styles.placeholderText}>spent how much?</Text> 
                  </View>
                ) : ( */}
                  {members.map((member) => (
                    <View key={member.id} style={styles.memberRow}>
                      <Text>{member.name}</Text>
                      <Text>{member.spent}</Text>
                    </View>
                  ))}

                  <View style={styles.phantomRow}>
                    <TextInput
                      value={newMemberName}
                      onChangeText={setNewMemberName}
                      onSubmitEditing={addMember}
                      returnKeyType="done"
                      placeholder="who"
                      style={styles.phantomInput}
                    />
                    <TextInput
                      value={newMemberSpent}
                      onChangeText={(text) => {
                          const numericText = text
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1");
                          setNewMemberSpent(numericText);
                        }}
                      onSubmitEditing={addMember}
                      returnKeyType="done"
                      placeholder="spent what?"
                      style={[styles.phantomInput, styles.price]}
                    />
                  </View>
                  
                {/* )} */}
              </ScrollView>
              <Button title="Close" onPress={() => setMembersModalVisible(false)} />
            </View>
          </View>
        </Modal>
        <View style={styles.middleSection}>
          {/* <View style={styles.itemList}> */}
          <ScrollView
            style={ styles.itemList}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.itemListContent}
            // showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              Platform.OS === "web" ? (
              <View
                key={item.id}
              >
                {/* <View style={styles.itemRow}> */}
                <Pressable
                  onPress={() => {
                    setEditingItem(item);
                    setPopupVisible(true);
                  }}
                  style={styles.itemRow}
                >
                  <View style={styles.itemDetails}>
                    <Text 
                      style={styles.itemText}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.paidBy !== null && (
                      <Text numberOfLines={1} style={styles.itemPayer}>
                        Paid by {members.find((member) => member.id === item.paidBy)?.name} for{" "}
                        {members.length > 0 &&
                        members.every((member) => item.paidFor.includes(member.id)) 
                          ? "All"
                          : item.paidFor
                            .map((memberId) => members.find((member) => member.id === memberId)?.name)
                            .filter(Boolean)
                            .join(", ")
                        }
                      </Text>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.itemPrice}>
                    {item.price}
                  </Text>
                {/* </View> */}
                </Pressable>
              </View>
              ): (
                  <ReanimatedSwipeable
                key={item.id}
                renderRightActions={() => (
                  <Pressable
                    onPress={() => deleteItem(item.id)}
                    style={styles.deleteAction}
                  >
                    <Text style={{ color: "white" }}>Delete</Text>
                  </Pressable>
                )}
              >
              {/* <View
                key={item.id}
              > */}
                {/* <View style={styles.itemRow}> */}
                <Pressable
                  onPress={() => {
                    setEditingItem(item);
                    setPopupVisible(true);
                  }}
                  style={styles.itemRow}
                >
                  <View style={styles.itemDetails}>
                    <Text 
                      numberOfLines={1}
                      style={styles.itemText}
                    >
                      {item.name}
                    </Text>
                    {item.paidBy !== null && (
                      <Text numberOfLines={1} style={styles.itemPayer}>
                        Paid by {members.find((member) => member.id === item.paidBy)?.name} for{" "}
                        {members.length > 0 &&
                        members.every((member) => item.paidFor.includes(member.id)) 
                          ? "All"
                          : item.paidFor
                            .map((memberId) => members.find((member) => member.id === memberId)?.name)
                            .filter(Boolean)
                            .join(", ")
                        }
                        {/* {item.paidFor.map((memberId) => members.find((member) => member.id === memberId)?.name).join(", ")} */}
                      </Text>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.itemPrice}>
                    {item.price}
                  </Text>
                {/* </View> */}
                </Pressable>
              {/* </View> */}
              </ReanimatedSwipeable>
              )
              ))
            }
            <View style={styles.phantomRow}>
              <Pressable 
                onPress={() => {
                  setPopupVisible(true)
                  setEditingItem(null)
                }}
                style={styles.phantomInput}
              >
                <Text style={styles.placeholderText}>Add an item...</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  setPopupVisible(true)
                  setEditingItem(null)
                }}
                style={styles.phantomInput}
              >
                <Text style={[styles.placeholderText, styles.price]}>Price</Text>
              </Pressable>
            </View>
            <AddItemModal
              visible={popupVisible}
              members={members}
              onClose={() => setPopupVisible(false)}
              onSave={addItem}
              editingItem={editingItem}
            />
          </ScrollView>
          {/* </View> */}
          <ExpenseTotals 
            total={computeItemTotal()}
            members={members}
            items={items}
            computeBalance={computeMemberExpenses}
          />
        </View>
        <View style={styles.BottomSection}>
          <Button 
            title="Add Item" 
            onPress={() => {
              setPopupVisible(true)
              setEditingItem(null)
            }} 
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#003049"
  },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    // marginVertical: 5,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    width: "85%",
    padding: 24,
    borderRadius: 12,
    backgroundColor: "white",
    gap: 16,
  },
  membersPopup: {
    height: "75%",
    maxHeight: "85%",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  memberOptions: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  memberOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
  },
  selectedMemberOption: {
    backgroundColor: "#b3d38e",
    borderColor: "#63833f",
  },
  itemPayer: {
    color: "#666",
    fontSize: 12,
  },
  memberList: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d62828",
    backgroundColor: "#fcbf49",
    padding: 10,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemList: {
    flex: 1,
    borderWidth: 5,
    borderColor: "#d62828",
    borderRadius: 20,
    backgroundColor: "#eae2b7",
    padding: 10,
  },
  itemListContent: {
    padding: 10,
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d62828",
    backgroundColor: "#eae2b7",
  },
  itemText: {
    color: "#003049",
    fontWeight: "bold"
  },
  itemDetails: {
    flex: 4,
    minWidth: 0,
  },
  itemPrice: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    color: "#f77f00",
    fontWeight: "bold"
  },
  placeholderText: {
    color: "#888",
  },
  HeaderSection: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  middleSection: {
    flex: 1,
  },
  BottomSection: {
    paddingVertical: 10,
  },
  Totals: {
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#b3d38e",
  },

  phantomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#d62828",
    // borderStyle: "dashed",
  },
  phantomInput: {
    width: "50%",
    // borderWidth: 1,
    // borderStyle: "dashed",
    // borderColor: "#aaa",
    // paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#999",
  },
  price: {
    textAlign: "right",
  },
  titleHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f77f00"
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c0392b",
    paddingHorizontal: 20,
  },
});
