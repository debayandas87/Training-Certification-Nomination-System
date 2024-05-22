import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Import the PDF icon
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import './Courses.css';
import axios from '../../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const names = ['All', 'Technical', 'Domain', 'Power', 'Process'];
const statuses = ['All', 'Not Opted', 'Pending for Approval', 'Assigned', 'Completed'];

function Certifications() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showPDF, setShowPDF] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();

  const empId = useSelector((state) => state?.auth?.user?.empId);

  // const dummyCourses = [
  //   {
  //     courseId: 1,
  //     courseName: 'React Fundamentals',
  //     domain: 'Technical',
  //     duration: '10,000',
  //     description: 'A beginner-friendly course on React fundamentals.',
  //     status: 'Not Opted'
  //   }
  // ];

  const getStatus = (pendingCertifications, certifications, certificationId) => {
    if (pendingCertifications.includes(certificationId)) {
      return 'Pending for Approval';
    }
    const certificationEntries = certifications.filter((cert) => cert.certificationId === certificationId);
    if (certificationEntries.length > 0) {
      const latestAttempt = certificationEntries.reduce(
        (latest, current) => (current.attempt > latest.attempt ? current : latest),
        certificationEntries[0]
      );

      return latestAttempt.status === 'inProgress' ? 'Approved' : 'Attempted';
    }
    return 'Not opted';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/certifications');

        const res = await axios.get(`/certifications/employee/${empId}`);

        console.log('res-->', empId);

        const pendingCertifications = res.data.pendingCertifications;
        const certifications = res.data.certifications;

        const temp = data?.map((cert) => ({ ...cert, status: getStatus(pendingCertifications, certifications, cert?.certificationId) }));

        setCourses(temp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleCheckboxChange = (event, courseId) => {
    const { checked } = event.target;
    setSelectedCourseIds((prevSelected) => {
      if (checked) {
        return [...prevSelected, courseId];
      } else {
        return prevSelected.filter((id) => id !== courseId);
      }
    });
  };

  const handleDomainChange = (event) => {
    setSelectedDomain(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const filterCourses = (course) => {
    if (selectedDomain === 'All' && selectedStatus === 'All') {
      return true;
    } else if (selectedDomain === 'All') {
      return course?.status === selectedStatus;
    } else if (selectedStatus === 'All') {
      return course?.category === selectedDomain;
    } else {
      return course?.category === selectedDomain && course?.status === selectedStatus;
    }
  };

  const openConfirmationDialog = () => {
    if (selectedCourseIds.length === 0) {
      alert('Please select at least one certification for nomination.');
    } else {
      setShowConfirmation(true);
    }
  };

  const closeConfirmationDialog = () => {
    setShowConfirmation(false);
  };

  const nominateCourses = async () => {
    const res = await axios.post(`/certifications/nominateCertification?empId=${empId}`, selectedCourseIds);
    setSelectedCourseIds([]);
    closeConfirmationDialog();
    navigate(0);
  };

  const cancelNomination = async (certificationId) => {
    const res = await axios.get(`/certifications/cancel?empId=${empId}&certificationId=${certificationId}`);
    navigate(0);
  };

  const handlePDFClick = () => {
    setShowPDF(true);
  };

  const handleClosePDF = () => {
    setShowPDF(false);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Available Certifications</h2>
      <div className="filters">
        <FormControl style={{ marginRight: '10px', marginLeft: '10px', marginTop: '10px' }}>
          <Select
            displayEmpty
            value={selectedDomain}
            onChange={handleDomainChange}
            renderValue={(selected) => {
              return 'Category';
            }}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="separator"></div>
        <FormControl style={{ marginRight: '10px', marginTop: '10px' }}>
          <Select
            displayEmpty
            value={selectedStatus}
            onChange={handleStatusChange}
            renderValue={(selected) => {
              return 'Status';
            }}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          className="nominateBtn"
          variant="outlined"
          startIcon={<LocalLibraryIcon />}
          onClick={openConfirmationDialog}
          style={{ marginLeft: 'auto', marginRight: '10px' }} // This will move the button to the right
        >
          Nominate
        </Button>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />} // Use the PDF icon
          onClick={handlePDFClick}
          style={{ marginRight: '10px' }} // Optional: adjust the margin to align with the nominate button
        >
          Reimbursement Policy
        </Button>
      </div>

      <div style={{ paddingTop: '2%', marginTop: '-20px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Certification Name</TableCell>
                <TableCell>Category</TableCell>
                {/* <TableCell>Duration</TableCell> */}
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.filter(filterCourses).map((row) => (
                <TableRow key={row?.certificationId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCourseIds.includes(row?.certificationId)}
                      onChange={(e) => handleCheckboxChange(e, row?.certificationId)}
                    />
                  </TableCell>
                  <TableCell>{row?.name}</TableCell>
                  <TableCell>{row?.category}</TableCell>
                  {/* <TableCell>{row.duration}</TableCell> */}
                  <TableCell style={{ color: row?.status === 'Pending for Approval' ? 'red' : 'inherit' }}>{row?.status}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => handleViewDetails(row)}>
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => cancelNomination(row?.certificationId)}
                      disabled={row?.status !== 'Pending for Approval'}
                      style={{ marginLeft: '8px' }}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={showDetails} onClose={handleCloseDetails}>
          <DialogTitle>Course Details</DialogTitle>
          <DialogContent>
            {selectedCourse && (
              <div>
                <h3>{selectedCourse?.name}</h3>
                <p>{selectedCourse.description}</p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onClose={closeConfirmationDialog}>
          <DialogTitle className="confirmation-title" style={{ fontSize: '20px', textAlign: 'center' }}>
            <b>Confirmation</b>
          </DialogTitle>
          <DialogContent className="confirmation-content" style={{ textAlign: 'center' }}>
            By clicking on Nominate, you are agreeing to the certification reimbursement policies. Do you still want to proceed?
          </DialogContent>
          <DialogActions className="confirmation-actions">
            <Button
              onClick={nominateCourses}
              className="confirmation-button-yes"
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                marginRight: '20px'
              }}
            >
              Yes
            </Button>
            <Button
              onClick={closeConfirmationDialog}
              className="confirmation-button-no"
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                marginRight: '210px'
              }}
            >
              No
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showPDF} onClose={handleClosePDF} maxWidth="lg" fullWidth>
          <DialogTitle>Certificate Reimbursement Policy</DialogTitle>
          <DialogContent>
            <embed src="../../../public/Certification Reimbursement Policy.pdf" type="application/pdf" width="100%" height="500px" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePDF}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Certifications;
