import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import './CoursesCompleted.css';

function createData(SNo, CertificationName, Duration, DateOfCompletion) {
  return { SNo, CertificationName, Duration, DateOfCompletion };
}

const rows = [
  createData(1, 'Certification 1', '2 ', '2024-04-15'),
  createData(2, 'Certification 2', '3 ', '2024-05-01'),
  createData(3, 'Certification 3', '4 ', '2024-03-01'),
  createData(4, 'Certification 4', '1 ', '2024-12-01'),
  createData(5, 'Certification 5', '6 ', '2024-06-01'),
  createData(1, 'Certification 1', '2 ', '2024-04-15'),
  createData(2, 'Certification 2', '3 ', '2024-05-01'),
  createData(3, 'Certification 3', '4 ', '2024-03-01'),
  createData(4, 'Certification 4', '1 ', '2024-12-01'),
  createData(5, 'Certification 5', '6 ', '2024-06-01'),
];

const CertificationsCompleted = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeIndex, setActiveIndex] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (sortConfig.key === 'DateOfCompletion') {
        return (dayjs(aValue).isAfter(dayjs(bValue)) ? 1 : -1) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      return aValue.localeCompare(bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
    }
    return 0;
  });

  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (!(auth?.isAuthenticated)) navigate('/login');
  }, [auth, navigate]);

  const getPieChartData = () => {
    const data = rows.reduce((acc, row) => {
      const month = dayjs(row.DateOfCompletion).format('MMM YYYY');
      const existingMonth = acc.find((item) => item.name === month);
      if (existingMonth) {
        existingMonth.value += 1;
      } else {
        acc.push({ name: month, value: 1 });
      }
      return acc;
    }, []);
    return data;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#c32148', '#777777', '#842593', '#f88379', '#AF7AC5', '#9FE2BF', '#B3B6B7', '#E727B0'];

  return (
    <div className="courses-completed-container">
      <div className="left-panel">
        <Typography variant="h3" gutterBottom style={{ marginBottom: '25px', textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '23px', marginRight: '10px' }}>Certifications Completed</span>
        </Typography>
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <TableContainer
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                paddingRight: '8px', // Adjust padding to accommodate scrollbar width
                marginBottom: '-16px', // Compensate for the added
              }}
              component={Paper}
              sx={{
                maxHeight: '100%',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px', // Reduce width of the scrollbar
                  borderRadius: '3px', // Round scrollbar corners
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#FFFFFF', // Background color of the scrollbar track
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#eee6ff', // Color of the scrollbar thumb (handle)
                  borderRadius: '3px', // Round scrollbar thumb corners
                },
              }}
            >
              <Table aria-label="completed certifications table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ textAlign: 'center' }}>S.No</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>Certification Name </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>Duration (hours) </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>Date of Completion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows
                    .filter((row) => {
                      if (!startDate && !endDate) return true;
                      const completionDate = dayjs(row.DateOfCompletion);
                      const afterStartDate = !startDate || completionDate.isAfter(startDate, 'day') || completionDate.isSame(startDate, 'day');
                      const beforeEndDate = !endDate || completionDate.isBefore(endDate, 'day') || completionDate.isSame(endDate, 'day');
                      return afterStartDate && beforeEndDate;
                    })
                    .map((row) => (
                      <TableRow key={row.SNo}>
                        <TableCell style={{ textAlign: 'center' }}>{row.SNo}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>{row.CertificationName}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>{row.Duration}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>{row.DateOfCompletion}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
      <div className="right-panel"> {/* Changed class name */}
        <Typography variant="h4" style={{ textAlign: 'center', marginTop: '50%', marginBottom: '-30px' }}>
          Monthly Completion Status
        </Typography>
        <ResponsiveContainer width="100%" height="70%">
          <PieChart>
            <Pie
              data={getPieChartData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="35%"
              outerRadius={105}
              fill="#8884d8"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.68;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                const percentage = Math.round(percent * 100);
                const spaceAvailable = innerRadius < 20 || outerRadius - innerRadius > 30;
                return spaceAvailable ? (
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {`${percentage}%`}
                  </text>
                ) : null;
              }}
              onMouseEnter={(e, entry) => setActiveIndex(entry.index)}
              onMouseLeave={() => setActiveIndex(null)}
              series={[
                {
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 20, additionalRadius: -20, color: 'gray' },
                },
              ]}
            >
              {getPieChartData().map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={activeIndex === index ? 1 : 0.7}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CertificationsCompleted;
