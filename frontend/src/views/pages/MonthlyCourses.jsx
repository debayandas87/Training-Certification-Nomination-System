import React, { useState, useEffect } from 'react';
import { Button, Table, TableHead, TableBody, TableCell, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../api/axios';
import useCourses from 'hooks/useCourses';
import currentMonth from 'utils/currentMonth';

const MonthlyCourses = () => {

  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { courses, loading, error } = useCourses();

  useEffect(() => {
    if (!(auth?.isAuthenticated && auth?.user?.role === "ADMIN")) navigate("/login");

  }, []);


const currentMonthUppercase = currentMonth();

  const [sortingOrder, setSortingOrder] = useState('ascending');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [domainFilter, setDomainFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState(currentMonthUppercase);

  const handleSortingOrderChange = () => {
    setSortingOrder(sortingOrder === 'ascending' ? 'descending' : 'ascending');
  };

  const removeCourse = async(id) => {
    try {
      const res = await axios.post(`/course/change-status?month=${monthFilter}`,[id])
      navigate(0);      
    } catch (error) {
      console.log(error)
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleDomainFilterChange = (event) => {
    setDomainFilter(event.target.value);
  };

  const handleMonthFilterChange = (event) => {
    setMonthFilter(event.target.value);
  };

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortingOrder === 'ascending') {
      return a?.courseName.localeCompare(b?.courseName);
    } else {
      return b?.courseName.localeCompare(a?.courseName);
    }
    return true;
  });

  const getArrow = (key) => {
    // if (sortConfig.key === key) {
    //   return sortConfig.direction === 'ascending' ? '▲' : '▼';
    // }
    return <ArrowDropDownIcon style={{ fontSize: '130%' }} />
    // return '▼';
  };


  const filteredCourses = sortedCourses.filter(course => {
    if (domainFilter === 'All') {
      return course?.monthlyStatus?.find(monthStatus => monthStatus?.month === monthFilter)?.activationStatus
    }else {
      return course?.domain === domainFilter && course?.monthlyStatus?.find(monthStatus => monthStatus?.month === monthFilter)?.activationStatus
    }
  });

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label>Filter by Domain:</label>
        <Select value={domainFilter} onChange={handleDomainFilterChange} style={{ marginLeft: '10px' }}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Technical">Technical</MenuItem>
          <MenuItem value="Non-Technical">Non-Technical</MenuItem>
          <MenuItem value="Power">Non-Technical</MenuItem>
          <MenuItem value="Process">Non-Technical</MenuItem>
        </Select>

        <label style={{ marginLeft: '20px' }}>Filter by Month:</label>
        <Select value={monthFilter} onChange={handleMonthFilterChange} style={{ marginLeft: '10px' }}>
          <MenuItem value="JANUARY">January</MenuItem>
            <MenuItem value="FEBRUARY">February</MenuItem>
            <MenuItem value="MARCH">March</MenuItem>
            <MenuItem value="APRIL">April</MenuItem>
            <MenuItem value="MAY">May</MenuItem>
            <MenuItem value="JUNE">June</MenuItem>
            <MenuItem value="JULY">July</MenuItem>
            <MenuItem value="AUGUST">August</MenuItem>
            <MenuItem value="SEPTEMBER">September</MenuItem>
            <MenuItem value="OCTOBER">October</MenuItem>
            <MenuItem value="NOVEMBER">November</MenuItem>
            <MenuItem value="DECEMBER">December</MenuItem>
        </Select>
      </div>

      <h2>Monthly Courses</h2>
      <Table sx={{ backgroundColor: 'white' }}>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              Course Name
              <Button variant="text" onClick={handleSortingOrderChange}>
                {sortingOrder === 'ascending' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Button>
            </TableCell>
            <TableCell align="center">Duration</TableCell>
            <TableCell align="center">Domain</TableCell>
            {/* <TableCell align="center">Month</TableCell> */}
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCourses.map(course => (
            <TableRow key={course?.courseId}>
              <TableCell>{course?.courseName}</TableCell>
              <TableCell align="center">{course?.duration}</TableCell>
              <TableCell align="center">{course?.domain}</TableCell>
              {/* <TableCell align="center">{course.month}</TableCell> */}
              <TableCell align="center">
                <Button variant="contained" onClick={() => removeCourse(course?.courseId)}>Remove</Button>
                <Button variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleViewDetails(course)}>View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showDetails} onClose={handleCloseDetails}>
        <DialogTitle>Course Details</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <div>
              <h3>{selectedCourse?.courseName}</h3>
              <p>{selectedCourse?.description}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MonthlyCourses;
