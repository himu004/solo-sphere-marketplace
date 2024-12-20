import axios from "axios";
import { compareAsc, format } from "date-fns";
import { useContext, useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import toast from "react-hot-toast";

const JobDetails = () => {

  const {user} = useContext(AuthContext);
 
  const [startDate, setStartDate] = useState(new Date());

  const [job, setJob] = useState({});

  const { id } = useParams();

  const navigate = useNavigate();

  const {
    job_title,
    deadline,
    description,
    min_price,
    max_price,
    category,
    buyer,
    _id
  } = job || {};

  useEffect(() => {
    fetchJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJobData = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/job/${id}`
    );
    setJob(data);
    // setStartDate(new Date(data.deadline));
  };

  // Get data from form for bid a for job

  const handleSubmitBid = async (e) => {
     e.preventDefault();
     const form = e.target;
     const price = form.price.value;
     const email = user?.email;
     const comment = form.comment.value;
     const jobId = _id;
    //  const deadline = startDate;
     const bidData = {price, email, comment, deadline: startDate, jobId};
    //  console.table(bidData);

    // 0. Check bid permission validation = buyer can't bid on his own job
    if(buyer?.email === user?.email) return toast.error("You can't bid on your own job");

    //  todo Validations
    // 1. Checking Deadline if it has passed or not => mean if todays date
    if(compareAsc(new Date(), new Date(deadline)) === 1) return toast.error("Deadline has been passed");

    // 2. Checking if the price passed the maximum price of the job
    if(price > max_price) return toast.error("Price is higher than the maximum price of the job");

    // 3. offered deadline should be less than the job deadline
    if(compareAsc(new Date(startDate), new Date(deadline)) === 1) return toast.error("Deadline should be less than the job deadline");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/add-bid`, bidData);
      form.reset();
      toast.success("Congratulations! You have successfully placed a bid");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }

  };

  return (
    <div className="flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto ">
      {/* Job Details */}
      <div className="flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-light text-gray-800 ">
            {deadline && format(new Date(deadline), "dd/MM/yyyy")}
          </span>
          <span className="px-4 py-1 text-xs uppercase rounded-full ">
            <div className="flex items-center gap-x-2">
              <p
                className={`px-3 py-1 ${
                  category === "Web Development" &&
                  "text-blue-500 bg-blue-100/60"
                } ${
                  category === "Graphics Design" &&
                  "text-green-500 bg-green-100/60"
                } ${
                  category === "Digital Marketing" &&
                  "text-red-500 bg-red-100/60"
                }  text-xs  rounded-full`}
              >
                {category}
              </p>
            </div>
          </span>
        </div>

        <div>
          <h1 className="mt-2 text-3xl font-semibold text-gray-800 ">
            {job_title}
          </h1>

          <p className="mt-2 text-lg text-gray-600 ">{description}</p>
          <p className="mt-6 text-sm font-bold text-gray-600 ">
            Buyer Details:
          </p>
          <div className="flex items-center gap-5">
            <div>
              <p className="mt-2 text-sm  text-gray-600 ">
                Name: {buyer?.name}
              </p>
              <p className="mt-2 text-sm  text-gray-600 ">
                Email: {buyer?.email}
              </p>
            </div>
            <div className="rounded-full object-cover overflow-hidden w-14 h-14">
              <img referrerPolicy="no-referrer" src={buyer?.photo} alt="" />
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-gray-600 ">
            Range: ${min_price} - ${max_price}
          </p>
        </div>
      </div>
      {/* Place A Bid Form */}
      <section className="p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]">
        <h2 className="text-lg font-semibold text-gray-700 capitalize ">
          Place A Bid
        </h2>

        <form onSubmit={handleSubmitBid}>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 " htmlFor="price">
                Price
              </label>
              <input
                id="price"
                type="text"
                name="price"
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="emailAddress">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                name="email"
                defaultValue={user?.email}
                disabled
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="comment">
                Comment
              </label>
              <input
                id="comment"
                name="comment"
                type="text"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label className="text-gray-700">Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className="border p-2 rounded-md"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default JobDetails;
