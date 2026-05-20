using System;

namespace Hexa_Hub.Models;
public class MultiValues
{
    public enum assetStatus
    {
        OpenToRequest=0,
        Allocated=1,
        UnderMaintenance=2
    }

    public enum UserType
    {
        Executive=0,
        Admin=1
    }

    public enum requestStatus
    {
        Pending=0,
        Allocated=1,
        Rejected=2
    }

    public enum issueType
    {
        Malfunction=1,
        Repair=2,
        Installation=3
    }

    public enum auditStatus
    {
        Sent=0,
        InProgress =1,
        Completed=2
    }

    public enum serviceReqStatus
    {
        UnderReview=0,
        Approved=1,
        Completed=2,
        Rejected =3
    }

    public enum ReturnReqStatus
    {
        Sent=0,
        Approved=1,
        Returned=2,
        Rejected=3
    }

}
