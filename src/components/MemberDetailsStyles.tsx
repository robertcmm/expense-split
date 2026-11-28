import { StyleSheet } from "react-native";

export const styles = StyleSheet.create ({
    container: {
        flex: 1
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
        borderRadius: 20,
        borderBottomLeftRadius: 5,
        backgroundColor: "#eae2b7",
        borderWidth: 2,
        borderLeftWidth: 5,
        borderBottomWidth: 3,
        borderColor: "#fcbf49",
        gap: 16,
    },
    header: {

    },
    headerText: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "right",

    },
    body: {

    },
    bodyTable: {
        borderWidth: 1,
        padding: 5,
    },
    bodyTableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        // borderBottomWidth: 1,
        // borderColor: "#f77f00"

    },
    bodyTableHeaderText:{
        fontWeight: "500",
        textShadowColor: "#003049",
        textShadowOffset: { width: 2, height: 1},
        textShadowRadius: 4,
    },
    bodyTableList :{
        paddingVertical: 5,
        maxHeight: 300,
    },
    bodyTableListItems: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: "#003049"
    },
});