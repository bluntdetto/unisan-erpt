import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Open Sans font
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "/OpenSans-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/OpenSans-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontFamily: "Open Sans",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
  },

  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  tableCellHeader: {
    margin: 5,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
  },
  colDate: { width: "6%" },
  colTaxpayer: { width: "25%" },
  colPeriod: { width: "8%" },
  colORNo: { width: "6%" },
  colBrgy: { width: "8%" },
  colClass: { width: "3%" },
  colBasic: { width: "36%" },
  colDayTotal: { width: "8%" },

  basicHeader: {
    width: "36%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold",
  },
});

// Create Document Component
const ARPTCDocument = ({ data, selectedMonth, selectedYear }) => {
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
    "default",
    { month: "long" }
  );

  // Group data by date
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  // Calculate daily totals and cumulative totals
  let cumulativeTotal = {
    currentYear: 0,
    discount: 0,
    priorYears: 0,
    penaltiesCurrentYear: 0,
    penaltiesPriorYears: 0,
    total: 0,
  };

  const dailyTotals = Object.keys(groupedData).reduce((acc, date) => {
    const dailyTotal = groupedData[date].reduce(
      (total, item) => {
        total.currentYear += item.currentYear;
        total.discount += item.discount;
        total.priorYears += item.priorYears;
        total.penaltiesCurrentYear += item.penaltiesCurrentYear;
        total.penaltiesPriorYears += item.penaltiesPriorYears;
        total.total += item.total;
        return total;
      },
      {
        currentYear: 0,
        discount: 0,
        priorYears: 0,
        penaltiesCurrentYear: 0,
        penaltiesPriorYears: 0,
        total: 0,
      }
    );

    cumulativeTotal = {
      currentYear: cumulativeTotal.currentYear + dailyTotal.currentYear,
      discount: cumulativeTotal.discount + dailyTotal.discount,
      priorYears: cumulativeTotal.priorYears + dailyTotal.priorYears,
      penaltiesCurrentYear:
        cumulativeTotal.penaltiesCurrentYear + dailyTotal.penaltiesCurrentYear,
      penaltiesPriorYears:
        cumulativeTotal.penaltiesPriorYears + dailyTotal.penaltiesPriorYears,
      total: cumulativeTotal.total + dailyTotal.total,
    };

    acc[date] = { dailyTotal, cumulativeTotal: { ...cumulativeTotal } };
    return acc;
  }, {});

  const TableHeader = () => (
    <>
      <View style={styles.tableRow}>
        <View style={[styles.tableColHeader, styles.colDate]}>
          <Text style={styles.tableCellHeader}>Date</Text>
        </View>
        <View style={[styles.tableColHeader, styles.colTaxpayer]}>
          <Text style={styles.tableCellHeader}>Taxpayer</Text>
        </View>
        <View style={[styles.tableColHeader, styles.colPeriod]}>
          <Text style={styles.tableCellHeader}>Period Covered</Text>
        </View>
        <View style={[styles.tableColHeader, styles.colORNo]}>
          <Text style={styles.tableCellHeader}>O. R. No.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.colBrgy]}>
          <Text style={styles.tableCellHeader}>Name of Brgy.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.colClass]}>
          <Text style={styles.tableCellHeader}>Class</Text>
        </View>
        <View style={styles.basicHeader}>
          <Text style={styles.tableCellHeader}>BASIC</Text>
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopStyle: "solid",
            }}
          >
            <View
              style={{
                width: "16.67%",
                borderRightWidth: 1,
                borderRightStyle: "solid",
              }}
            >
              <Text style={styles.tableCellHeader}>Current Yr.</Text>
            </View>
            <View
              style={{
                width: "16.67%",
                borderRightWidth: 1,
                borderRightStyle: "solid",
              }}
            >
              <Text style={styles.tableCellHeader}>Discount</Text>
            </View>
            <View
              style={{
                width: "16.67%",
                borderRightWidth: 1,
                borderRightStyle: "solid",
              }}
            >
              <Text style={styles.tableCellHeader}>Prior Yrs.</Text>
            </View>
            <View style={{ width: "33.33%" }}>
              <Text style={styles.tableCellHeader}>Penalties</Text>
              <View
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderTopStyle: "solid",
                }}
              >
                <View
                  style={{
                    width: "50%",
                    borderRightWidth: 1,
                    borderRightStyle: "solid",
                  }}
                >
                  <Text style={styles.tableCellHeader}>Current Yr.</Text>
                </View>
                <View style={{ width: "50%" }}>
                  <Text style={styles.tableCellHeader}>Prior Yrs.</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: "16.67%",
                borderLeftWidth: 1,
                borderLeftStyle: "solid",
              }}
            >
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>
        </View>
        <View style={[styles.tableColHeader, styles.colDayTotal]}>
          <Text style={styles.tableCellHeader}>Day Total</Text>
        </View>
      </View>
    </>
  );

  const TableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <View style={[styles.tableCol, styles.colDate]}>
        <Text style={styles.tableCell}>{item.date}</Text>
      </View>
      <View style={[styles.tableCol, styles.colTaxpayer]}>
        <Text style={styles.tableCell}>{item.taxpayer}</Text>
      </View>
      <View style={[styles.tableCol, styles.colPeriod]}>
        <Text style={styles.tableCell}>{item.period}</Text>
      </View>
      <View style={[styles.tableCol, styles.colORNo]}>
        <Text style={styles.tableCell}>{item.ORNumber}</Text>
      </View>
      <View style={[styles.tableCol, styles.colBrgy]}>
        <Text style={styles.tableCell}>{item.brgy}</Text>
      </View>
      <View style={[styles.tableCol, styles.colClass]}>
        <Text style={styles.tableCell}>{item.class}</Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>{item.currentYear.toFixed(2)}</Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>{item.discount.toFixed(2)}</Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>{item.priorYears.toFixed(2)}</Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>
          {item.penaltiesCurrentYear.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>
          {item.penaltiesPriorYears.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}>{item.total.toFixed(2)}</Text>
      </View>
      <View style={[styles.tableCol, styles.colDayTotal]}>
        <Text style={styles.tableCell}></Text>
      </View>
    </View>
  );

  const BlankRow = () => (
    <View style={styles.tableRow}>
      <View style={[styles.tableCol, styles.colDate]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colTaxpayer]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colPeriod]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colORNo]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colBrgy]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colClass]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={styles.tableCell}></Text>
      </View>
      <View style={[styles.tableCol, styles.colDayTotal]}>
        <Text style={styles.tableCell}></Text>
      </View>
    </View>
  );

  const TotalRow = ({ total, label, style }) => (
    <View style={[styles.tableRow, style]}>
      <View style={[styles.tableCol, { width: "56%" }]}>
        <Text
          style={[styles.tableCell, styles.boldText, { textAlign: "right" }]}
        >
          {label}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.currentYear.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.discount.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.priorYears.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.penaltiesCurrentYear.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.penaltiesPriorYears.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, { width: "6%" }]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.total.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.tableCol, styles.colDayTotal]}>
        <Text style={[styles.tableCell, styles.boldText]}>
          {total.total.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const rowsPerPage = 20;

  const renderPage = (pageData, date, pageIndex, totalPages, isLastPage) => (
    <Page
      key={`${date}-${pageIndex}`}
      size="LEGAL"
      orientation="landscape"
      style={styles.page}
    >
      <Text style={styles.title}>ABSTRACT OF REAL PROPERTY TAX COLLECTION</Text>
      <View style={styles.header}>
        <Text>LGU: Unisan, Quezon</Text>
        <Text style={{ fontWeight: "bold" }}>BASIC TAX</Text>
        <Text>Sheet No. {pageIndex + 1}</Text>
      </View>
      <Text style={{ fontSize: 10, marginBottom: 10 }}>Period: {date}</Text>

      <View style={styles.table}>
        <TableHeader />
        {pageData.map((item, index) => (
          <TableRow key={index} item={item} />
        ))}
        {[...Array(Math.max(0, rowsPerPage - pageData.length))].map(
          (_, index) => (
            <BlankRow key={`empty-${index}`} />
          )
        )}
        {isLastPage && (
          <>
            <TotalRow
              total={dailyTotals[date].dailyTotal}
              label={`Day Total (${date}):`}
              style={{ backgroundColor: "#f2e7c3" }}
            />
            <TotalRow
              total={dailyTotals[date].cumulativeTotal}
              label="Cumulative Total:"
              style={{ backgroundColor: "#ffcccb" }}
            />
          </>
        )}
      </View>
    </Page>
  );

  const pages = [];
  let overallPageIndex = 0;

  Object.keys(groupedData).forEach((date) => {
    const dateData = groupedData[date];
    const totalPagesForDate = Math.ceil(dateData.length / rowsPerPage);

    for (let i = 0; i < totalPagesForDate; i++) {
      const startIndex = i * rowsPerPage;
      const pageData = dateData.slice(startIndex, startIndex + rowsPerPage);
      const isLastPage = i === totalPagesForDate - 1;
      pages.push(
        renderPage(
          pageData,
          date,
          overallPageIndex,
          totalPagesForDate,
          isLastPage
        )
      );
      overallPageIndex++;
    }
  });

  return <Document>{pages}</Document>;
};

export { ARPTCDocument };
