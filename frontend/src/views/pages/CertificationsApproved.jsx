import 'chart.js/auto';
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Typography,
  TextField,
  Rating
} from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import getEmployee from '../../utils/getEmployee';
import getAllCertifications from '../../utils/getAllCertifications';

function CertificationsApproved() {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const [certifications, setCertifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comments: '' });
  const [selectedCertificationIndex, setSelectedCertificationIndex] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(''); // State to hold selected file
  const [selectedFile, setSelectedFile] = useState(null); // State to hold selected file object
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (!auth?.isAuthenticated) navigate('/login');

    const fetchData = async () => {
      try {
        const allCertifications = await getAllCertifications();

        const employee = await getEmployee(auth?.user?.email);

        const temp = employee?.certifications?.map((completedCertificate) => {
          const certificateDetails = allCertifications?.find((cert) => cert?.certificationId === completedCertificate?.certificationId);
          return {
            name: certificateDetails?.name,
            status: completedCertificate?.status,
            attempts: completedCertificate?.attempt
          };
        });

        setCertifications(temp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [auth, navigate]);

  const handleSelfAssessmentClick = (index) => {
    setSelectedCertificationIndex(index);
    setModalOpen(true);
    // Reset state variables for upload file modal
    setSelectedFileName('');
    setSelectedFile(null);
    // Reset state variable for feedback modal
    setFeedbackData({ rating: 0, comments: '' });
  };

  const handleCloseModal = (completed) => {
    const updatedCertifications = [...certifications];
    if (completed) {
      // Open the certificate upload modal
      setCertificateModalOpen(true);
    } else {
      // Change the status of the certification to failed
      updatedCertifications[selectedCertificationIndex].status = 'failed';
    }
    setCertifications(updatedCertifications);
    // Close the current modal
    setModalOpen(false);
  };

  // Function to handle file upload event
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFileName(file ? file.name : ''); // Update the selected file name
    setSelectedFile(file); // Set the selected file
  };

  // Function to handle certificate upload
  const handleCertificateUpload = () => {
    if (!selectedFile) {
      alert('Please upload a file before submitting.');
      return;
    }

    // Change the status of the certification to completed
    const updatedCertifications = [...certifications];
    updatedCertifications[selectedCertificationIndex].status = 'completed';
    setCertifications(updatedCertifications);

    // Close the certificate upload modal
    setCertificateModalOpen(false);
    // Open the feedback modal
    setFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFeedbackSubmit = () => {
    // Implement your logic to submit feedback
    console.log(feedbackData); // For demonstration, log feedback data
    setFeedbackOpen(false);
    setSnackbarOpen(true); // Open the Snackbar
  };

  const countByStatus = () => {
    return certifications.reduce((acc, certification) => {
      acc[certification.status] = (acc[certification.status] || 0) + 1;
      return acc;
    }, {});
  };

  const [chartData, setChartData] = useState(countByStatus());

  useEffect(() => {
    setChartData(countByStatus());
  }, [certifications]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return '#3498db'; // Blue color for Ongoing
      case 'completed':
        return '#2ecc71'; // Green color for Passed
      case 'failed':
        return '#e74c3c'; // Red color for Failed
      default:
        return '#000';
    }
  };

  const pieData = Object.keys(chartData).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    value: chartData[status],
    percentage: ((chartData[status] / certifications.length) * 100).toFixed(1) + '%'
  }));

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCertifications = [...certifications].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        return aValue?.localeCompare(bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
      } else if (sortConfig.key === 'attempts') {
        return (parseInt(aValue) - parseInt(bValue)) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
    }
    return 0;
  });

  return (
    <div>
      <h2 style={{ paddingBottom: '20px', textAlign: 'center' }}>Certifications Approved</h2>
      <div className="container">
        <div className="content-section" style={{ display: 'flex' }}>
          <div className="certifications-section" style={{ flex: '0 1 70%', marginRight: '20px', textAlign: 'center' }}>
            <div style={{ flex: '1', overflow: 'hidden' }}>
              <div style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                <TableContainer
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    paddingRight: '8px', // Adjust padding to accommodate scrollbar width
                    marginBottom: '-16px' // Compensate for the added
                  }}
                  component={Paper}
                  sx={{
                    maxHeight: '100%',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px', // Reduce width of the scrollbar
                      borderRadius: '3px' // Round scrollbar corners
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#FFFFFF' // Background color of the scrollbar track
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#eee6ff', // Color of the scrollbar thumb (handle)
                      borderRadius: '3px' // Round scrollbar thumb corners
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead style={{ textAlign: 'center' }}>
                      <TableRow>
                        <TableCell
                          onClick={() => handleSort('name')}
                          style={{ textAlign: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                        >
                          Certification Name
                          <ArrowDropDownIcon style={{ fontSize: '130%' }} />
                        </TableCell>
                        <TableCell
                          style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          onClick={() => handleSort('attempts')}
                          style={{ textAlign: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                        >
                          Attempts
                          <ArrowDropDownIcon style={{ fontSize: '130%' }} />
                        </TableCell>
                        <TableCell style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedCertifications.map((certification, index) => (
                        <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                          <TableCell style={{ textAlign: 'center' }}>{certification.name}</TableCell>
                          <TableCell style={{ textAlign: 'center' }}>
                            <Typography variant="body1" style={{ fontWeight: 'bold', color: getStatusColor(certification.status) }}>
                              {certification.status.charAt(0).toUpperCase() + certification.status.slice(1)}
                            </Typography>
                          </TableCell>
                          <TableCell style={{ textAlign: 'center' }}>{certification.attempts}</TableCell>
                          <TableCell style={{ textAlign: 'center' }}>
                            {certification.status === 'ongoing' && (
                              <Button
                                variant="contained"
                                style={{ backgroundColor: '#3498db', color: 'white', marginRight: '8px' }}
                                onClick={() => handleSelfAssessmentClick(index)}
                              >
                                Self Assessment
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
          <div className="pie-chart-section" style={{ flex: '0 1 30%', position: 'sticky', top: 20 }}>
            <Typography variant="h4" style={{ textAlign: 'center', marginTop: '0%', marginBottom: '-60px', fontSize: '18px' }}>
              Progress Tracker
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  fill="#8884D8"
                  labelLine={false} // Remove lines extending from the numbers
                  // Render custom label inside the pie chart
                  // Render custom label inside the pie chart
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // Adjust label radius
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#fff" // Set text color to white
                        textAnchor="middle" // Center align the text horizontally
                        dominantBaseline="middle" // Center align the text vertically
                        fontSize={14} // Adjust font size as needed
                      >
                        {`${Math.round(percent * 100)}%`}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Ongoing' ? '#3498db' : entry.name === 'Failed' ? '#e74c3c' : '#2ecc71'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <Modal open={modalOpen} onClose={() => handleCloseModal(false)}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '40px',
              outline: 'none',
              borderRadius: '8px',
              width: '60%',
              maxWidth: '400px'
            }}
          >
            <Typography variant="h4" gutterBottom style={{ fontSize: '24px', textAlign: 'center' }}>
              Self Assessment
            </Typography>
            <Typography variant="subtitle1" gutterBottom style={{ fontSize: '18px', textAlign: 'center' }}>
              Have you cleared the certification exam?
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
              <Button
                variant="contained"
                style={{ width: '45%', backgroundColor: '#2ecc71', color: 'white', fontSize: '1rem' }}
                onClick={() => handleCloseModal(true)}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                style={{ width: '45%', backgroundColor: '#e74c3c', color: 'white', fontSize: '1rem' }}
                onClick={() => handleCloseModal(false)}
              >
                No
              </Button>
            </div>
          </div>
        </Modal>

        {/* New Modal for Certificate Upload */}
        <Modal open={certificateModalOpen} onClose={() => setCertificateModalOpen(false)}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '40px',
              outline: 'none',
              borderRadius: '8px',
              width: '60%',
              maxWidth: '400px'
            }}
          >
            <Typography variant="h4" gutterBottom style={{ fontSize: '24px', textAlign: 'center' }}>
              Upload Passing Certificate
            </Typography>
            <Typography variant="subtitle1" gutterBottom style={{ fontSize: '16px', textAlign: 'center' }}>
              Please upload your passing certificate for verification.
            </Typography>
            <div style={{ margin: '20px auto', textAlign: 'center' }}>
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} id="upload-file" />
              <label htmlFor="upload-file">
                <Button variant="contained" color="primary" component="span">
                  Choose File
                </Button>
              </label>
              <span style={{ marginLeft: '10px' }}>{selectedFileName}</span> {/* Display selected file name */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
              <Button variant="contained" color="primary" onClick={handleCertificateUpload}>
                Submit
              </Button>
            </div>
          </div>
        </Modal>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000} // Duration for the Snackbar to remain open (3 seconds)
          onClose={handleSnackbarClose}
        >
          <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Thank you for submitting your feedback!
          </MuiAlert>
        </Snackbar>

        <Modal open={feedbackOpen} onClose={handleFeedbackClose}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '40px',
              outline: 'none',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '500px'
            }}
          >
            <Typography variant="h4" gutterBottom style={{ fontSize: '24px', textAlign: 'center' }}>
              Certification Feedback
            </Typography>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom style={{ fontSize: '18px' }}>
                Rate the certification:{' '}
                <span style={{ color: '#3453cf', fontWeight: 'bold' }}>{certifications[selectedCertificationIndex]?.name}</span>{' '}
                {/* Display certification name in blue */}
              </Typography>
              <div style={{ display: 'inline-block' }}>
                <Rating
                  name="certification-rating"
                  value={feedbackData.rating}
                  onChange={(event, newValue) => setFeedbackData({ ...feedbackData, rating: newValue })}
                  aria-required
                  size="large" // Set the size of the stars to large
                />
              </div>
            </div>
            <TextField
              id="comments"
              label="Comments"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={feedbackData.comments}
              onChange={(event) => setFeedbackData({ ...feedbackData, comments: event.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button variant="contained" color="primary" onClick={handleFeedbackSubmit} disabled={feedbackData.rating === 0}>
                Submit
              </Button>
              <Button variant="contained" onClick={handleFeedbackClose} style={{ marginLeft: '10px' }}>
                Skip
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default CertificationsApproved;
