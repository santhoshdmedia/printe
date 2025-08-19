/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Careers = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const jobOpenings = [
    {
      id: 1,
      title: "UI/UX Designer",
      location: "Remote",
      type: "Part-Time",
      description:
        "We are seeking a talented UI/UX Designer to craft user-friendly interfaces and improve user experiences.",
      requirements: [
        "2+ years of experience in UI/UX design.",
        "Proficiency in design tools like Figma, Adobe XD, or Sketch.",
        "Strong understanding of user-centered design principles.",
      ],
    },
    {
      id: 2,
      title: "Accountant",
      location: "New York, NY",
      type: "Full-Time",
      description:
        "We are hiring a detail-oriented Accountant to manage financial transactions and ensure compliance with regulations.",
      requirements: [
        "3+ years of experience in accounting or finance.",
        "Proficient in accounting software like QuickBooks or Xero.",
        "Strong understanding of financial regulations and reporting.",
      ],
    },
  ];

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      resume: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(`Application submitted for ${selectedJob.title}`);
    closeModal();
  };

  const handlechange = () => {
    navigate("/help");
  };

  return (
    <div className="py-10 px-[6vw] md:px-[8vw] xl:px-[10vw]">
      <div className="bg-primary text-white rounded-2xl p-10 text-center">
        <h1 className="text-4xl font-bold">Join Our Team</h1>
        <p className="mt-4 text-lg">
          Be part of a dynamic team where innovation and creativity thrive.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold">Why Work With Us?</h2>
        <p className="mt-4 text-gray-700">
          At our company, we value collaboration, growth, and creating
          meaningful work. We offer competitive benefits, professional
          development opportunities, and a vibrant work culture that fosters
          creativity and innovation.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold">Current Openings</h2>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {jobOpenings.map((job) => (
            <div
              key={job.id}
              className="bg-gray-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="mt-2 text-gray-600">{job.location}</p>
              <p className="text-gray-600">{job.type}</p>
              <p className="mt-4">{job.description}</p>
              <ul className="mt-4 list-disc pl-5 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
              <button
                className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => openModal(job)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 bg-gray-800 text-white rounded-2xl p-10 text-center">
        <h2 className="text-3xl font-bold">We&apos;d Love to Hear From You!</h2>
        <p className="mt-4">
          If you don’t see a role that matches your skills, reach out to us with
          your resume. Let’s build something great together!
        </p>
        <button
          onClick={() => handlechange()}
          className="mt-6 bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Us
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-8 w-96">
            <h2 className="text-2xl font-bold mb-4">
              Apply for {selectedJob?.title}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Resume</label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
